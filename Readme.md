# Git-Connect

It is a simple github authorization plugin, that helps you to communicate with
[Github API](https://developer.github.com/v3/) completely inside the browser,
without using your own server.

This plugin is used along with auxiliary proxy server, that forces [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
limitations and multi-step [OAuth](https://developer.github.com/v3/oauth/) process, and also stores your sensitive data.
You can use [git-proxy](https://github.com/krispo/git-proxy) server for this purpose.
This server should been installed **only once** (on heroku cloud), and can maintain all your web applications.

Why you should use proxy is described in detail by Christopher Chedeau in his [great post](http://blog.vjeux.com/2012/javascript/github-oauth-login-browser-side.html).

## How to use

1. Install [git-proxy](https://github.com/krispo/git-proxy) server (if it is not already installed) according to instruction in the repo.
2. Install plugin via bower
```
bower install git-connect
```
and add script to html:
```html
<script src="bower_components/git-connect/git-connect.js"></script>
```
3. Add script to the page that initializes connection with github:
```html
<script>
    var connection = window.connection({
        client_id: "asd3427e34w9472jf316cb0f", //required; your application `client_id` in Github
        proxy: "http://your-git-proxy.herokuapp.com", //required; Base_URI to your git-proxy server
        scope: 'public_repo,gist', //optional, default: 'public_repo'; Github scopes like repo,gist,user,...
        expires: 7,  //optional, default: 7; the number of days after coockies expire

        //this options are used and required only for `git-edit` module
        owner: 'github_username',  //application owner's github username
        reponame: 'github_reponame', //application's repository name
    });
</script>
```

Now, to connect to github, use:
```javascript
connection.connect();
```
to get `access_token` from cookies:
```javascript
var token = connection.isConnected();
```
You can pass `access_token` to any API wrappers, like [github](https://github.com/michael/github) or [node-github](https://github.com/mikedeboer/node-github), to get any information from Github.

All available `connection` method are described below.

## API
Base api for `connection`:
* `isConnected() : string` - Check if user is connected to Github, return `access_token` or `''`;
* `connect() : unit` -- Connect to github;
* `disconnect() : unit` - Disconnect from Github;
* `toggle() : unit` - Connect or disconnect;
* `withCredentials(callbackFn) : function` - Get credentials (username, access_token, user_info), return callbackFn(err, username, access_token, user_info);
* `parseUrl(param) : string` - Parse url and return `param` value;
* `setCookie(name, value, expires) : unit` - Specify cookie with name, value and expire date;
* `getCookie(name) : string` - Get cookie value;
* `deleteCookie([name1,...]) : unit` - Delete cookies by names.

Global events:
* `IsConnectedToGithubEvent` - arises after user connects to Github;
* `IsDisconnectedFromGithubEvent` - arises after user disconnects from Github

You can subscribe to any event like:
```javascript
document.addEventListener('IsConnectedToGithubEvent', function(event){
    /* do smth after user is connected to github */
    var _connection = event.detail; // get connection instance from event
});
```

---

See [demo](http://krispo.github.io/git-connect/).

[MIT License](https://github.com/krispo/git-connect/blob/master/LICENSE)