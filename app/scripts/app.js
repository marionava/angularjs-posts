(function() {
    'use strict';

    angular.module('blog', ['ngRoute', 'blog.controllers', 'blog.templates']);

    function config ($locationProvider, $routeProvider) {
        //Permite que las rutas NO lleven el carater # al inicio de ellas
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl : 'views/post-list.tpl.html',
                controller : 'PostListController',
                controllerAs : 'postlist'
            })
            .when('/posts/:postId', {
                templateUrl : 'views/post-detail.tpl.html',
                controller : 'PostDetailController',
                controllerAs : 'postdetail'
            })
            .when('/new', {
                templateUrl : 'views/post-create.tpl.html',
                controllers : 'PostCreateController',
                controllerAs : 'postcreate'
            });
    }
    //Asociamos la funcion config creada en el módulo
    angular
        .module('blog')
        .config(config);

}) ();
