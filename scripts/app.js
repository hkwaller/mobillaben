(function () {
    "use strict";
    angular.module("app", ["ngRoute", "ngAnimate", "ui.bootstrap", "mgo-angular-wizard", "app.controllers", 'firebase']).config(["$routeProvider",
        function ($routeProvider) {
            return $routeProvider.when("/", {
                redirectTo: "/dashboard"
            }).when("/dashboard", {
                templateUrl: "views/dashboard.html"
            }).when("/pages/signin", {
                templateUrl: "views/pages/signin.html"
            }).when("/404", {
                templateUrl: "views/pages/404.html"
            }).otherwise({
                redirectTo: "/404"
            })
        }
    ])

}.call(this),
 
function () {
    "use strict";
    angular.module("app.controllers", []).controller("AppCtrl", ["$scope", "$location",
        function ($scope, $location) {
            return $scope.isSpecificPage = function () {
                var path;
                return path = $location.path(), _.contains(["/404", "/pages/500", "/pages/login", "/pages/signin", "/pages/signin1", "/pages/signin2", "/pages/signup", "/pages/signup1", "/pages/signup2"], path)
            }, $scope.main = {
                brand: "laben",
                name: "Hannes Waller"
            }
        }
    ]).controller("DashboardCtrl", ["$scope", '$firebase', '$filter',
        function ($scope, $firebase, $filter) {
            var FIREBASE_URI = 'https://mobillaben.firebaseio.com/';
            var ref = new Firebase(FIREBASE_URI + "/utstyr");
            var loan = new Firebase(FIREBASE_URI + "/loan");
            $scope.list = $firebase(ref);
            $scope.loans = $firebase(loan);
            
            var temp = angular.extend([], $scope.list);
            
            var listArray = [];
            
            $scope.list.$on('change', function() {
                listArray.length = 0;
                angular.extend(temp, $filter('orderByPriority')($scope.list));
                for (var i = 0; i < temp.length; i++) {
                    listArray.push(temp[i]);
                }
            });
            
            $scope.productActive = true;
            $scope.loanActive = true;
            
            $scope.count = 0;
            var array = [];
            
            ref.on('value', function(snapshot) {
               snapshot.forEach(function() {
                   $scope.count++;
                   array.push(snapshot.child("name").val());
               });
            });
            
            $scope.add = function(product) {    
                product.available = true;
                $scope.list.$add(product);
                $scope.count++;
                $scope.product = {
                    product: null,
                    brand: null,
                    type: null,
                    os: null
                }
            }
            $scope.parseDate = function(str) {
                var mdy = str.split('/')
                return new Date(mdy[2], mdy[0]-1, mdy[1]);
            }

            $scope.daydiff = function(first, second) {
                return (second-first)/(1000*60*60*24);
            }
            
            $scope.date = new Date();
            
            console.log($scope.date);
            
            $scope.startLoan = function(loan) {
                var tempArray = loan.selected.split(" ");
                var brand = tempArray[0];
                var model = "";
                
                for (var i = 1; i < tempArray.length; i++) {
                    model += tempArray[i] + " ";   
                }
                
                var tempString = "";
                
                for (var i = 0; i < listArray.length; i++) {
                    tempString = listArray[i].brand + " " + listArray[i].type;
                    if (tempString === loan.selected) {
                        listArray[i].available = false;
                        listArray[i].loanee = loan.loanee;
                        listArray[i].date = $scope.parseDate(new Date());
                        
                        $scope.loans.$add(listArray[i]);
                        var update = $scope.list.$child(listArray[i].$id);
                        update.$set({available: false,
                                     brand: listArray[i].brand,
                                     os: listArray[i].os,
                                     product: listArray[i].product,
                                     type: listArray[i].type
                                    });
                    }
                }
            }

        }]).controller("TypeaheadCtrl", ["$scope", "$firebase", "$filter",
            function ($scope, $firebase, $filter) {
                var FIREBASE_URI = 'https://mobillaben.firebaseio.com/';
                var ref = new Firebase(FIREBASE_URI + "/utstyr");
                
                var dataObj = $firebase(ref);
                var temp = angular.extend([], dataObj);
                $scope.states = [];
                console.log(temp);
                dataObj.$on('change', function() {
                    $scope.states.length = 0;
                    angular.extend(temp, $filter('orderByPriority')(dataObj));
                    for (var i = 0; i < temp.length; i++) {
                        $scope.states.push(temp[i].brand + " " + temp[i].type);
                    }
                });
                
                $scope.selected = void 0; 
             
            }
        ]);
}.call(this));