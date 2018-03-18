module.exports = function(grunt) {

    require('jit-grunt')(grunt);

    const configs = {
        build: {
            src: 'src',
            dir: 'dist',
            srcDir: 'dist/src',
            envConfigDir: 'environment'
        }
    };

    const options = {
        build: {
            env: grunt.option('env') || 'dev'
        },
        clasp: {
            refreshToken: grunt.option('clasp_refresh_token'),
            lastCommit: grunt.option('last_commit')
        },
        webstore: {
            target: grunt.option('webstore_target'),
            credentials: {
                clientId : grunt.option('ws_client_id'),
                clientSecret : grunt.option('ws_client_secret'),
                refreshToken : grunt.option('ws_refresh_token')
            }
        }
    };

    console.log(`Environment used is ${options.build.env}`);

    const deploymentConfig = grunt.file.readJSON(`./${configs.build.envConfigDir}/${options.build.env}/deployment_config.json`);

    // init config object
    grunt.initConfig({
        configs: configs,
        options: options,
        clean: {
            all: ['<%= configs.build.dir %>']
        },
        copy: {
            all: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= configs.build.src %>/',
                        src: ['**/*.js', '**/*.html', '**/*.json'],
                        dest: '<%= configs.build.srcDir %>/',
                        flatten: true,
                        filter: 'isFile',
                        rename: function (dest, src) {
                            return dest + src.replace(/\.js$/, '.gs');
                        }
                    }
                ]
            }
        },
        concat: {
            dist: {
                src: ['<%= configs.build.envConfigDir %>/<%= options.build.env %>/config.js', '<%= configs.build.envConfigDir %>/defaultConfig.js'],
                dest: '<%= configs.build.srcDir %>/config.gs'
            },
            options: {
                process: function (content, src) {
                    if (src === `${configs.build.envConfigDir}/defaultConfig.js`) {
                        return 'var env = "' + options.build.env + '";\r\n' + content;
                    } else return content;
                }
            }
        },
        jasmine: {
            src: 'src/**/*.js',
            options: {
                specs: 'spec/**/*.js'
            }
        },
        config: {
            clasp: {
                src: "<%= configs.build.srcDir %>/.clasp.json",
                dest: "<%= configs.build.srcDir %>/.clasp.json",
                configuration: deploymentConfig.clasp
            },
            scriptManifest: {
                src: '<%= configs.build.srcDir %>/appsscript.json',
                dest: '<%= configs.build.srcDir %>/appsscript.json',
                configuration: deploymentConfig.script_manifest || {}
            }
        },
        clasp: {
            newVersion: {
                runDir: configs.build.srcDir
            },
            push: {
                runDir: configs.build.srcDir
            },
            deployNonAddons: {
                runDir: configs.build.srcDir
            }
        },
        compress: {
            addonWebstore: {
                options: {
                    archive: `./${configs.build.dir}/addon_webstore_draft.zip`,
                    mode: 'zip'
                },
                files: [
                    { src: './addon_webstore/**' }
                ]
            }
        },
        webstore:{
            updateItem: {
                /** Do publish or just update the draft */
                publish: !!deploymentConfig.publishing.publish,

                /** @type {'trustedTesters' | 'default'} */
                target: options.webstore.target || 'trustedTesters'
            }
        }
    });

    grunt.registerTask('clasp_cred', 'Preparing CLASP credentials', function(){
        if(options.clasp.refreshToken) grunt.file.write(".clasprc.json", JSON.stringify({ "refresh_token": options.clasp.refreshToken}))
    });

    // custom task to change *.json
    grunt.registerMultiTask('config', 'Update properties in *.json file', function(){

        if (!this || !this.data || !this.data.src || !this.data.dest) return;

        const configFile = this.files[0].src[0],
            configFileTarget = this.files[0].dest;

        let newConfig = this.data.configuration,
            config;
        try {
            // read config file
            config = grunt.file.readJSON(configFile)
        }
        catch (e) {
            config = {};
        }

        // update the provided parameters
        for (let i in newConfig){
            // noinspection JSUnfilteredForInLoop
            config[i] = newConfig[i];
        }

        // write updated config
        const configStr = JSON.stringify(config);
        grunt.file.write(configFileTarget, configStr);

    });

    // Use clasp
    grunt.registerMultiTask('clasp', 'push content in script, and create a version', function(){
        const child_process = require('child_process');

        /**
         * @type {{
         *   command: string,
         *   runDir: string
         * }}
         */
        let param = this.data;

        function clasp(cmd){
            try {
                let res = child_process.execSync(`clasp ${cmd}`, {
                    cwd: __dirname +'/'+ param.runDir
                });

                // Get string res
                return res.toString();
            } catch (er) {
                console.log("and error while trying to push", er)
            }

        }

        switch (this.target){
            case 'push':
                // Push
                console.log('Pushing files to the script');
                let pushRes = clasp('push');

                // Check result
                let resPush = /Pushed\s(\d+)\sfiles\./.exec(pushRes);
                if (!resPush) throw 'Error while pushing files to AppsScript';
                console.log(`Pushed files: ${resPush[1]}`);

                break;

            case 'newVersion':
                // create a new version
                console.log('Creating new script version');
                let versionRes = clasp(`version ${options.clasp.lastCommit || ""}`);

                // Check result and get version num
                let resVers = /version\s(\d+)/.exec(versionRes);
                if (!resVers) throw 'Error while creating new version';

                let versionNum = +resVers[1];
                console.log('New version num: ' + versionNum);

                // Update version value:
                deploymentConfig.publishing.version = versionNum;

                break;

            case 'deployNonAddons':
                console.log('Deploying non addons if config exists in the appsscript.json manifest');
                clasp(`deploy ${deploymentConfig.publishing.version + options.clasp.lastCommit || ""}`);
                break;
        }
    });

    grunt.registerTask('webstore_dist', 'Preparing Webstore dist content', function(){
        if(deploymentConfig.publishing) {
            let manifest = deploymentConfig.publishing.manifest;

            if (!deploymentConfig.publishing.version){
                console.error(`The webstore draft can't be created with no script version`);

                return false;
            }

            // Update script version
            manifest.container_info.container_version = deploymentConfig.publishing.version;
            // Bump manifest version (as script are always versioned, this should suffice)
            const manifestVersion = deploymentConfig.publishing.versionOffset + deploymentConfig.publishing.version;

            console.log("Webstore manifest version has been prepared : " + manifestVersion);

            manifest.version = manifestVersion.toString();

            grunt.file.write(`./addon_webstore/manifest.json`, JSON.stringify(manifest))
        }
    });

    grunt.registerMultiTask('webstore', 'use Webstore API to send a draft and publish it', function(){
        if(deploymentConfig.publishing) {
            const webstore = require('webstore-upload');

            const PUBLISH_DRAFT = this.data.publish;

            const PUBLICATION_TARGET = this.data.target || 'trustedTesters' ;

            const uploadOptions = {
                accounts: {
                    default: {
                        client_id: options.webstore.credentials.clientId,
                        client_secret: options.webstore.credentials.clientSecret,
                        refresh_token: options.webstore.credentials.refreshToken
                    }
                },
                extensions: {
                    addon: {
                        //required
                        appID: deploymentConfig.publishing.appID,
                        //required, we can use dir name and upload most recent zip file
                        zip: `${configs.build.dir}/addon_webstore_draft.zip`,
                        publishTarget: PUBLICATION_TARGET,
                        publish: PUBLISH_DRAFT
                    }
                },
                uploadExtensions : ['addon']
            };

            let done = this.async();

            webstore(uploadOptions, 'default').then(() => {
                console.log('Published with success');
                done();
            })
                .catch(() => {
                    console.error('Publishing failed');
                    done(false);
                });
        }
    });

    grunt.registerTask('build', [
        'jasmine',
        // 'clean',
        'copy',
        'concat',
        'config:clasp',
        'config:scriptManifest'
    ]);

    grunt.registerTask('push', [
        'clasp_cred',
        'clasp:push'
    ]);

    grunt.registerTask('publishAddon', [
        'clasp_cred',
        'clasp:push',
        'clasp:newVersion',
        'webstore_dist',
        'compress:addonWebstore',
        'webstore:updateItem'
    ]);

    grunt.registerTask('build_push', [
        'build',
        'push',
    ]);

    grunt.registerTask('build_publish', [
        'build',
        'publishAddon'
    ]);

    // define default task (for grunt alone)
    grunt.registerTask('default', ['build']);


    grunt.registerTask('test', ['jasmine']);
};