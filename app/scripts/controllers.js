(function() {
    'use strict';
    angular
        .module('blog.controllers', ['blog.services']);

    function PostListController(Post) {
        this.posts = Post.query();
    }

    function PostDetailController($routeParams, Post, Comment, User) {
        this.post = {};
        this.comments = {};

        var self = this; //Para guardar la referencia

        Post.query({ id: $routeParams.postId })
            .$promise.then(
                //Succes
                function (data) {
                    self.post = data[0];
                    self.user = User.query({ id: self.user.userId });
                },
                //Error
                function (error) {
                    console.log(error);
                }
            );
        this.comments = Comment.query({ postId: $routeParams.postId });
    }

    function PostCreateController(Post) {
        this.create = function () {
            Post.save(this.post);
        };
    }

    angular
        .module('blog.controllers', ['blog.services'])
        .controller('PostListController', PostListController)
        .controller('PostDetailController', PostDetailController)
        .controller('PostCreateController', PostCreateController);

}) ();
