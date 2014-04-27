//Title: linear gradient with layers
//Author: Nathaniel Foster
//Date: 02-28-2014

// TODO: move layer preview to layer selection

// layers = {
// 	list: [],
// 	add: function() {},
// 	dlt: function() {},
// 	get_layer: function() {},
// 	get_layer_gradient: function() {},
// 	get_all_layer_gradient: function() {},
//
//
// }
var Color = function(val, percentage) {
	var color = {
		val : val,
		percentage : {
			val : percentage,
			plus : function () {
				this.val++;
			},
			minus : function () {
				this.val--;
			}
		}
	}
	return color;
};
angular.module('app', ['ngTouch']);
var cache = window.localStorage ? window.localStorage : {};
var LAYER1_COLORS = [
			new Color ("rgba(50,50,255,1)", 50),
			new Color ("rgba(255,50,50,1)", 51)
		],
		LAYER2_COLORS = [
			new Color ("rgba(74, 255, 74, 0.3)", 50),
		  new Color ("rgba(246, 255, 0, 0.5)", 51)
		];


$(document).ready(function (e) {
	document.getElementById("control-panel").style.display = "block";
});

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand_color() {
	var min = 0,
		max = 255,
		color = {
		r: getRandomInt(min, max),
		g: getRandomInt(min, max),
		b: getRandomInt(min, max),
		o: Math.random().toFixed(2)
	}

	return color;
};

var Layer = function(id, colors, angle) {
	var layer = {
		id: id,
		gradientDirection: "linear",
		angle: {
			val: angle, //getRandomInt(0,360),
			plus: function () {
				this.val++;
			},
			minus: function() {
				this.val--;
			}
		},
		isPercentage: false,
		isRepeating: false,
		isRadial: false,
		size: 30,
		selected: true,
		// colors: colors,
		color: {
			list: colors,
			add: function () {
				this.list.push({val: "#ff0000", percentage: 100});
			},
			remove: function () {
					this.list.splice(index, 1);
			}
		}
	}

	return layer;
};

var app = angular.module('app', []);

app.directive('uiColorpicker', function() {
		return {
				restrict: 'E',
				require: 'ngModel',
				scope: false,
				replace: true,
				template: "<span><input type='color' class='input-small' /></span>",
				link: function(scope, element, attrs, ngModel) {
						var input = element.find('input');
						var options = angular.extend({
								color: ngModel.$viewValue,
								move: function(color) {
										scope.$apply(function() {
											ngModel.$setViewValue(color.toRgbString());
										});
								},
								showAlpha: true,
								clickoutFiresChange: true
						}, scope.$eval(attrs.options));

						ngModel.$render = function() {
							input.spectrum('set', ngModel.$viewValue || '');
						};

						input.spectrum(options);
				}
		};
});

app.controller('ColorCtrl', function($scope) {
	// display options
	$scope.display = "block";
	$scope.isVisible = true;
	$scope.isBack = false;
	$scope.displayAngle = "block";
	$scope.currentIndex = 0;

	$scope.saveToCache = function() {
		cache["saved"] = JSON.stringify({
			list: $scope.layer.list,
			size: $scope.size
		});
	};

	// 	control open/close gradient ui
	$scope.$watch(function() {
		var name = "";
		if ($scope.isVisible) {
			$scope.iconDisplay = "icon-caret-up";
			$scope.display = "block";
			name = "Close";
		} else {
			$scope.iconDisplay = "icon-caret-down";
			$scope.display = "none";
			name = "Open";
		}
		return name;
	},function(name){
		$scope.displayToggle = name;
	});

	$scope.layer = {
		index: 0,
		list: [new Layer(0, LAYER1_COLORS, 135)],
		current: {},
		add : function() {
			var newIndex = this.list.length;

			this.list[newIndex] = new Layer(newIndex, [
															new Color ("rgba(74, 255, 74, 0.3)", 50),
															new Color ("rgba(246, 255, 0, 0.5)", 51)
														], 225);
			this.change(newIndex);
		},
		remove : function() {
			console.log(this.current.index);
			var index = $scope.layer.current.index,
				newIndex = (index === 0) ? 0 : index - 1;

			this.list.splice(index, 1);
			this.change(newIndex);
		},
		change : function(index) {
			this.current = $scope.layer.list[index];
			this.current.index = index;
		}
	};

	$scope.init = function () {
		if (cache["saved"] &&
				cache["saved"].length > 0 ) {
					console.log(cache["saved"]);
					var saved = JSON.parse(cache["saved"]);
					$scope.layer.list = saved.list;
					$scope.size = saved.size;
				}

		$scope.layer.current = $scope.layer.list[0];
	};

	// css for layer index
	$scope.indexCss = function () {
		// do something to show the selected layer.
	}

	$scope.size = {
		val: 50,
		isPercentage: false,
		measurement: "px",
		plus: function () {
				this.val++;
		},
		minus: function() {
				this.val--;
		}
	}

	// 	size measurement is percentage or px
	$scope.$watch(function() {
		var s = $scope.size;
		s.measurement = (s.isPercentage) ? "%" : "px";
		return	s.val + s.measurement + " " + s.val + s.measurement + ";";
	},function(opt) {
		$scope.bgSize = opt;
		$scope.saveToCache();
	});

	$scope.$watch(function() {
		var l = $scope.layer.current;
		l.gradientDirection  = (l.isRadial) ? "Radial" : "Linear";
		$scope.iconDirection = (l.isRadial) ? "icon-radio-checked" : "icon-menu";
		$scope.displayAngle  = (l.isRadial) ? "none" : "block";
		return l.gradientDirection;
	},function(name) {
		console.log(name);
		$scope.nameDirection = name;
	});

	// display: btn isRepeating
	$scope.$watch(function() {
		return ($scope.layer.current.isRepeating) ? "Repeating - On" : "Repeating - Off";
	},function(name) {
		$scope.nameRepeating = name;
	});

	function createGradient(colors) {
		var color = ""
			strLstColors = "",
			strColor = "";

		len = colors.length;
		for (var i=0; i<len; i++) {
			color = colors[i];
			strColor = color.val + " " + color.percentage.val + "%";
			if (i+1!==len) strColor += ","
			strLstColors += strColor;
		}
		return strLstColors;
	};

	function createGradientPrefixes (lyr, h) {
		var prefixes = [
				//"-webkit-gradient(",
				"-moz-",
				"-webkit-",
				"-o-",
				"-ms-",
				""
			],
			len = prefixes.length,
			gradientPrefix = "",
			bg = [];

		for (var i=0; i<len; i++) {
			bg[i] = (bg[i]) ? bg[i] + gradients[i] : gradients[i];
			if(lyr.isRepeating) bg[i] += "repeating-";
			bg[i] += lyr.gradientDirection + "-gradient( ";
			if (lyr.gradientDirection.toLowerCase() === "linear") bg[i] += lyr.angle.val + "deg, ";
			bg[i] += strLstColors+")";
			if (h !== 0) bg[i] += ",";
			else bg[i] += ";";
		}
		return bg;

	};
	$scope.layerGradients = [];

	// display: create gradient from layer and add to display
	$scope.$watch(function() {
		var color = ""
			strColor = "",
			strLstColors = "",
			len = 0,
			prefixLayer = [],
			bg = [],
			gradients = [
					//"-webkit-gradient(",
					"-moz-",
					"-webkit-",
					"-o-",
					"-ms-",
					""
			];

		var lyr = {};
		for (var h=$scope.layer.list.length-1; h>=0; h--) {
			lyr = $scope.layer.list[h];
			strLstColors = createGradient(lyr.color.list);

			// loop through different browser css prefixes
			// len = gradients.length;
			var l = "";
			for (var i=0; i<len; i++) {

				l = gradients[i];
				if(lyr.isRepeating) l += "repeating-";
				l += lyr.gradientDirection + "-gradient( ";
				if (lyr.gradientDirection.toLowerCase() === "linear") l += lyr.angle.val + "deg, ";
				l += strLstColors+")";
				prefixLayer[i] = l + ";";
				if (h !== 0) l += ",";
				else l += ";";

				bg[i] = (bg[i]) ? bg[i] + l : l;
			}
			$scope.layer.list[h].gradient = prefixLayer.join("background: ");
		}
		$scope.cssBg = bg;
		return bg.join("background: ");
	}, function(bgImage) {
		$scope.bgImage = bgImage;
		$scope.saveToCache();
	});

	$scope.showCSS = function() {
		var css =	"background: " + this.bgImage +
					"background-size: " + this.bgSize + ";";

		document.querySelector("#control-panel").classList.toggle("flip");
	};
});

angular.bootstrap(document, ['app']);
