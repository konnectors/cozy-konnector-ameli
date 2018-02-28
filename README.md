# [Cozy][cozy] Ameli

[![Build Status](https://travis-ci.org/konnectors/cozy-konnector-ameli.svg?branch=master)](https://travis-ci.org/konnectors/cozy-konnector-ameli)

## What's Cozy?

![Cozy Logo](https://cdn.rawgit.com/cozy/cozy-guidelines/master/templates/cozy_logo_small.svg)

[Cozy] is a platform that brings all your web services in the same private space. With it, your webapps and your devices can share data easily, providing you with a new experience. You can install Cozy on your own hardware where no one's tracking you.

## What's this konnector?

The konnector gets information from Ameli (website of the "Sécurité sociale", the French public
medical insurance).
In France, you pay your health care but the health insurances pay you back (in part) after.
Sometimes, you don't even have to pay and the health insurances directly pay the health provider
(isThirdPartyPayer field to `true`).

## What data is imported ?

This konnector imports the list of reimbursements metadata that you can see in the
["Mes paiements"](https://assure.ameli.fr/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page)
page when you filter the page 6 month back in time (as this website allows). It uses the detailed view.
All this data is stored in `io.cozy.bills` doctype with a `isRefund` attribute to make a difference
with other bills. This data is mostly used by the Banks application to link bank operations to
health expenses and reimbursements.

For each reimbursement, an associated PDF invoice is downloaded (`YYYYMMDD_ameli.pdf`) (many reimbursements can have the
same associated file and the file is only downloaded once. You can find the imported files in the
drive application.

Each health care is separated to make it easy to find the associated paiment in the bank
operations.

An example of imported data can be seen in [./importedData.json](./importedData.json)

Take a look at the [documentation](https://github.com/cozy/cozy-doctypes/blob/master/docs/io.cozy.bills.md)
to have the signification of the fields in this file but the important fields for bank operation
matching are : isThirdPartyPayer, date, originalDate, amount, groupAmount, originalAmount, invoice.

### Open a Pull-Request

If you want to work on this konnector and submit code modifications, feel free to open pull-requests! See the [contributing guide][contribute] for more information about how to properly open pull-requests.

### Test the connector without an accessible cozy-stack

If you just want to test this connector without any cozy available.

You first need an installed [nodejs] (LTS version is fine). This project has a '.nvmrc' file, so if you use nvm, simply do 'nvm use'.

We also suggest you tu use [yarn] instead of npm for node packages.

```sh
npm install --global yarn
```

Then just run :

```sh
yarn
yarn standalone
```

The requests to the cozy-stack will be stubbed using the [./fixture.json] file as source of data
and when cozy-client is asked to create or update data, the data will be output to the console.
The bills (or any file) will be saved in the root directory.

### Run the connector linked to a cozy-stack

If you do not want to have to install the konnector on a cozy v3 to test it, you can register the
konnector as an OAuth application with the following commands :

```sh
yarn
yarn dev
```

This command will register your konnector as an OAuth application to the cozy-stack. By default,
the cozy-stack is supposed to be located in http://cozy.tools:8080. If this is not your case, just
update the COZY_URL field in [./konnector-dev-config.json].

After that, your konnector is running but should not work since you did not specify any credentials to
the target service. You can do this in [./konnector-dev-config.json] in the fields attribute

Now run `yarn dev` one more time, it should be ok.

The files are saved in the root directory of your cozy by default.

### How does the cozy-stack run the connector ?

The cozy-stack runs the connector in a rkt container to be sure it does not affect the environment.

The connector is run by calling npm start with the following envrionment variables :

* COZY_CREDENTIALS needs to be the result of `cozy-stack instances token-cli <instance name> <scope>`
* COZY_URL is the full http or https url to your cozy
* COZY_FIELDS is something like :

```javascript
{
  "data":{
    "attributes":{
      "arguments":{
        "account":"cf31eaef5d899404a7e8c3737c1c2d1f",
        "folder_to_save":"folderPathId",
        "slug":"ameli"
      }
    }
  }
}
```

The "account" field is the id of the record with doctype "io.cozy.accounts" which will be used as
parameters for your konnector.

### Build (without Travis)

To be able to run the connector, the cozy stack needs a connector which is built into only one
file, without needing to npm install it, this will be a lot faster to install.

There is a command in package.json to help you to do that : `yarn build`

This command uses [webpack] to bundle all the code needed by your connector into one file.

This will generate an index.js file in the build directory and add all files the connector will need.

You can deploy this build by using the specific script : `yarn deploy`

This command will commit and push your built in the branch `build` fo your project.

And your konnector can now be installed using the following url :

git://github.com/konnectors/cozy-konnector-ameli.git#build

### Build using Travis CI

This project contains a `.travis.yml` config file which allows you to build your connector
automatically using [Travis-CI][travis].

You can follow these steps to enable building using Travis:

* On your [travis-ci.org][travis] account, find your project name (should be the same than your Github repository) and enable Travis by using the related checkbox.
* Once enabled, go to this project on Travis by clicking on it and go to the "Settings" menu by using the "More options" menu at the top right.
* Enable these three options:
  * "Build only if .travis.yml is present"
  * "Build branch updates" (run Travis after each branch update)
  * "Build pull request updates" (run Travis after each Pull Request update)
* Then, you have to generate a Github token in [your Github account settings](https://github.com/settings/tokens). Here is the [Github blog post about API token](https://github.com/blog/1509-personal-api-tokens). Don't forget to authorize the access to the repo scope like following: ![repo scope](https://cloud.githubusercontent.com/assets/10224453/26671128/aa735ec2-46b4-11e7-9cd0-25310100e05e.png)
* Then, add an environment variable (still in your Travis project settings) named `GITHUB_TOKEN` and use your previous generated Github token as value (We highly recommand you to **keep the checkbox "Display value in build log" to OFF value** in order to keep your token value hidden in the Travis logs.)

Now Travis is ready to build your project, it should build it each time your push a commit in your repository or create a pull request.

> **Note:** Travis will push your build to your `build` branch ONLY for commits made on your master branch (included PR merge commits). You can see the related Travis statement [here](https://github.com/cozy/cozy-konnector-template/blob/master/.travis.yml#L27).

### Standard

We use [standard] to format the `index.js` file. You can run it with:

```sh
yarn lint
```

### Maintainer

The lead maintainers for this konnector is Brice Coquereau

### Get in touch

You can reach the Cozy Community by:

* Chatting with us on IRC [#cozycloud on Freenode][freenode]
* Posting on our [Forum]
* Posting issues on the [Github repos][github]
* Say Hi! on [Twitter]

## License

Ameli is developed by Brice Coquereau and distributed under the [AGPL v3 license][agpl-3.0].

[cozy]: https://cozy.io "Cozy Cloud"
[agpl-3.0]: https://www.gnu.org/licenses/agpl-3.0.html
[freenode]: http://webchat.freenode.net/?randomnick=1&channels=%23cozycloud&uio=d4
[forum]: https://forum.cozy.io/
[github]: https://github.com/cozy/
[nodejs]: https://nodejs.org/
[standard]: https://standardjs.com
[twitter]: https://twitter.com/mycozycloud
[webpack]: https://webpack.js.org
[yarn]: https://yarnpkg.com
[travis]: https://travis-ci.org

Big big thanks to [Gara64](https://github.com/gara64), who created this konnector in v2. I used his code a lot.
