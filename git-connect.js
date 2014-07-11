'use strict';
/*
 * Javascript plugin for providing token-base Github OAuth via proxy with cookie storage.
 * https://github.com/krispo/git-connect
 */
(function(){

    var XMLHttpRequest,
        connection = {};

    /*
     * Connection definition, return connection
     * config = {
     *      client_id: <client_id>,  // github application
     *      proxy: <proxy>,          // git-proxy server
     *      owner: <admin_username>, // admin username
     *      reponame: <reponame>,    // application repository name
     *      scope: <list of scopes>, // repo,gist,user,...
     *      expires: <days>          // the number of days after cookies expire
     * }
     */
    window.connection = function(config){
        if (!arguments.length) return connection;

        connection['config'] = { scope: 'public_repo', expires: 7 };
        for (var key in config){
            connection.config[key] = config[key];
        };

        if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined'){
            XMLHttpRequest = window.XMLHttpRequest;
        };
        var code = connection.parseUrl('code');
        if (code){
            get_request(connection.config['proxy'] + '/github_access_token?code=' + code + '&client_id=' + connection.config['client_id'], function(error, data){
                if (error === null) {
                    connection.setCookie('github_access_token', data['access_token'], connection.config['expires']);
                    window.location.href = window.location.href.replace(/[\\?&]code=[^&#]*/, '');
                } else console.log(error);
            })
        };

        connection.isConnected()
            ? document.dispatchEvent(new CustomEvent('IsConnectedToGithubEvent', { 'detail': connection }))
            : document.dispatchEvent(new CustomEvent('IsDisconnectedFromGithubEvent', { 'detail': connection }));

        return connection;
    };

    // Check if user is connected to github
    connection.isConnected = function(){
        return  connection.getCookie('github_access_token') !== '';
    };

    // Connect to github
    connection.connect = function(){
        window.location.href = 'https://github.com/login/oauth/authorize?client_id=' + connection.config['client_id']+'&scope=' + connection.config['scope'];
    };

    // Disconnect from github
    connection.disconnect = function(){
        connection.deleteCookies(['github_access_token']);
        window.location.reload();
    };

    // Connection toggle
    connection.toggle = function(){
        connection.isConnected() ? connection.disconnect() : connection.connect();
    };

    // Get credentials: username, access_token
    connection.withCredentials = function(callback){
        var access_token = connection.getCookie('github_access_token');
        if (access_token){
            get_request('https://api.github.com/user?access_token=' + access_token, function(error, data){
                return (error === null) ? callback(null, data['login'], access_token, data) : callback(error);
            });
        } else return callback('User is not authorized...')
    };

    // Get 'param' from url
    connection.parseUrl = function(param){
        param = param.replace(/[\[]/,'\\\[').replace(/[\]]/,'\\\]');
        var regex = new RegExp( '[\\?&]'+param+'=([^&#\/]*)' );
        var results = regex.exec( window.location.href );
        return results === null ? null : results[1];
    };

    // Set cookie with name, value and expires - the number of days
    connection.setCookie = function(name, value, expires) {
        var d = new Date();
        d.setTime(d.getTime() + (expires*24*60*60*1000));
        var expires = 'expires=' + d.toGMTString();
        document.cookie = name + '=' + value + '; ' + expires;
    };

    // Get cookie by name
    connection.getCookie = function(name) {
        var name = name + '=';
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return '';
    };

    // Delete all cookies from array - names
    connection.deleteCookies = function(names){
        for (var i = 0; i < names.length; ++i) {
            document.cookie = names[i] + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    };

    // Handling GET request, return JSON
    function get_request(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status >= 200 && this.status < 300 || this.status === 304) {
                    callback(null, JSON.parse(this.responseText));
                } else {
                    callback({request: this, error: this.status});
                }
            }
        };
        xhr.send();
    }
})()