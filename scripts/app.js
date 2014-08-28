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
            var sync = $firebase(ref);
            var syncLoans = $firebase(loan);
            
            var listarray = sync.$asArray();
            $scope.list = listarray;
            
            var loanarray = syncLoans.$asArray();
            $scope.loans = loanarray;
            
            $scope.productActive = true;
            $scope.loanActive = true;
            
            $scope.add = function(product) {    
                product.available = true;
                $scope.list.$add(product);
                $scope.product = {
                    product: null,
                    brand: null,
                    type: null,
                    os: null
                }
                $scope.productActive = false;
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
                
                for (var i = 0; i < $scope.list.length; i++) {
                    tempString = $scope.list[i].brand + " " + $scope.list[i].type;
                    if (tempString === loan.selected) {
                        
                        $scope.list[i].available = false;
                        $scope.list.$save(i);
                        $scope.list[i].loanee = loan.loanee;
                        $scope.list[i].date = new Date();
                        $scope.list[i].phonenumber = loan.phonenumber;
                        
                        loanarray.$add({available: false, 
                                        brand: $scope.list[i].brand,
                                        date: $scope.list[i].date,
                                        loanee: loan.loanee,
                                        os: $scope.list[i].os,
                                        product: $scope.list[i].product,
                                        type: $scope.list[i].type,
                                        phonenumber: loan.phonenumber}).then(function(ref) {
                           var id = ref.name();
                        });
                        $scope.loan = {
                            selected: "",
                            loanee: "",
                            phonenumber: ""
                        };
                        $scope.loanActive = false;
                    }
                }
            }

        }]).controller("TypeaheadCtrl", ["$scope", "$firebase", "$filter",
            function ($scope, $firebase, $filter) {
                var FIREBASE_URI = 'https://mobillaben.firebaseio.com/';
                var ref = new Firebase(FIREBASE_URI + "/utstyr");
                var sync = $firebase(ref);

                var listarray = sync.$asArray();
                
                $scope.states = [];
                
                listarray.$loaded().then(function() {
                    angular.forEach(listarray, function(rec) {
                        if (rec.available === true) $scope.states.push(rec.brand + " " + rec.type);
                    });                
                });


                $scope.selected = void 0; 
             
            }
        ]);
}.call(this));