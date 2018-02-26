# Apps Script continuous integration with Travis CI. 

This startup project automates build, test, push and publishing to Google webstore using (Grunt, jasmine-phantomjs, Google Clasp, Google Webstore and Travis CI).

### How do I get set up? ###

* Summary of set up

1. We assume that Webstorm, Git, and npm are installed on you computer.
2. Clone the Git repository
3. Run npm install in project root to install node_modules necessary to run grunt and build the project

* Deployment instructions

1. Rename and copy files: Execute ``grunt`` for dev or ``grunt -env=[environment]*`` for the other environments inside the main working directory
2. Update the script: ``grunt push --env=[environment]``
3. Both can be executed with: ``grunt build_push --env=[environment]``
4. To publish an addon (JUST FOR TEST): ``grunt build_publish`` 
    * and other options are available:
        * ``--last_commit=[commit_hash]``
        * ``--webstore_target=[publish_target]``
    
#### Config file format:

When publishing as an Addon with the command add:

/environment/[environment]/deployment_config.json
```json
{
    "clasp": {
        "scriptId": "$TARGET_SCRIPT_ID$"
    },
    "script_manifest": {},
    "publishing": {
        "version": null,
        "versionOffset": 0,
        "account": "$ACCOUNT_NAME_FOR_WEBSTORE_CREDENTIAL$",
        "appID": "$WEBSTORE_ITEM_ID$",
        
        "manifest": {
            "update_url" : "https://clients2.google.com/service/update2/crx",
            "container" : ["GOOGLE_SPREADSHEET"],
            "app" : {
                "background" : {
                    "scripts" : ["background.js"]
                }
            },
            "api_console_project_id" : "$SCRIPT_PROJECT_ID$",
            "container_info" : {
                "post_install_tip" : "$POST_INSTAL_TEXT$",
                "container_id" : "$OLD_SCRIPT_ID$",
                "container_version" : "0"
            },
            "manifest_version" : 2,
            "name" : "$ADDON_NAME$",
            "icons" : {
                "16" : "script-icon_16.png",
                "128" : "script-icon_128.png"
            },
            "version" : "0"
        }
    }
}
```

NOTE: The "manifest" key can be copied from the chrome webstore item, all field will already be correctly filled.

NOTE: The first publishing must be done manually.

NOTE: fill the "script_manifest" key with this format: https://developers.google.com/apps-script/concepts/manifests#manifest_structure


#### Credential file format:

Those credentials can be obtained by creating a Google project on the addon used to publish the Addon.
Then following the instructions here: https://developer.chrome.com/webstore/using_webstore_api#beforeyoubegin
Download the json file for the created ClientID and use it to fill the credential file below.

More information on the webstore API used: https://www.npmjs.com/package/webstore-upload

/build/config/$CONFiG_NAME$_config.json
```json
{
    "$ACCOUNT_NAME_FOR_WEBSTORE_CREDENTIAL$": {
        "refresh_token": "$REFRESH_TOKEN$",
        "installed": {
            "client_id": "$CLIENT_ID$",
            "client_secret": "$CLIENT_SECRET$"
        }
    },
    "$ANOTHER_ACCOUNT_NAME_FOR_WEBSTORE_CREDENTIAL$": "{...}"
}
```
NOTE: The first code obtain when executing the procedure to obtain the refresh_token is NOT the refresh_token, it's a authorizatin code (starting by "4/")

The refresh_token usualy starts by "1/" and is obtained by exchanging the auth code. All the procedure on this page must be followed until the end: https://developer.chrome.com/webstore/using_webstore_api#beforeyoubegin


* Test instructions

1. Publish -> Test as add-on (non-triggerable functionalities)
2. Publish -> Publish as add-on with permission to people with link (for triggable functionalities)
3. If the status of the add-on gets stuck on "Pending Review" status when publishing publicly, then try to contact google using this [link](https://support.google.com/chrome_webstore/contact/developer_support) 
4. When changing scopes of the add-on you might need to submit OAuth clientId using this [form](https://support.google.com/code/contact/oauth_app_verification)