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

angular.module('app', ['ngTouch']);
var cache = window.localStorage ? window.localStorage : {};
var LAYER1_COLORS = [{
						val: "rgba(50,50,255,1)",
						percentage: 50
					},{
						val: "rgba(255,50,50,1)",
						percentage: 51
					}],
	LAYER2_COLORS = [{
						val: "rgba(74, 255, 74, 0.3)",
						percentage: 50
					},{
						val: "rgba(246, 255, 0, 0.5)",
						percentage: 51
					}];
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
	var color1 = rand_color(),
		color2 = rand_color();
	var layer = {
		id: id,
		gradientDirection: "linear",
		angle: angle, //getRandomInt(0,360),
		isPercentage: false,
		isRepeating: false,
		isRadial: false,
		size: 30,
		selected: true,
		colors: colors
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
		var options = {
			isPercentage:	   $scope.isPercentage,
			isRepeating:	   $scope.isRepeating,
			isRadial: 		   $scope.isRadial,
			size: 			   $scope.size,
			colors: 		   $scope.colors,
			gradientDirection: $scope.gradientDirection
		};
		cache["savedImage"] = JSON.stringify(options);
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

	$scope.layers = [new Layer(0, LAYER1_COLORS, 135)];
	$scope.layer = $scope.layers[0];

	// css for layer index
	$scope.indexCss = function () {
		// do something to show the selected layer.
	}

	$scope.addLayer = function () {
		var newIndex = $scope.layers.length;

		$scope.layers[newIndex] = new Layer(newIndex, LAYER2_COLORS, 225);
		$scope.changeLayer(newIndex);
	}

	$scope.removeLayer = function() {
		console.log($scope.currentIndex);
		var index = $scope.currentIndex,
			newIndex = (index === 0) ? 0 : index - 1;


		$scope.layers.splice(index, 1);
		$scope.changeLayer(newIndex);
	};

	$scope.changeLayer = function(index) {
		$scope.layer = $scope.layers[index];
		$scope.currentIndex = index;
	}

	// $scope.init = function() {
// 		// check for saved image;
// 		if ( cache["savedImage"] &&
// 			 cache["savedImage"].length > 0 ) {
// 			var options = JSON.parse(cache["savedImage"]);
// 			$scope.gradientDirection = options.gradientDirection;
// 			$scope.isPercentage		 = options.isPercentage;
// 			$scope.isRepeating		 = options.isRepeating;
// 			$scope.isRadial			 = options.isRadial;
// 			$scope.colors 			 = options.colors;
// 			$scope.size 			 = options.size;
// 		} else {
// 			$scope.gradientDirection = "radial";
// 			$scope.isPercentage = false;
// 			$scope.isRepeating = true;
// 			$scope.isRadial = true;
// 			$scope.colors = [
// 				{val: "#7ae2ff", percentage: 50},
// 				{val: "#000077", percentage: 51}
// 			];
// 			$scope.size = 34;
// 		}
// 	};

	// 	size measurement is percentage or px
	$scope.$watch(function() {
		$scope.layer.measurement = ($scope.isPercentage) ? "%" : "px";
		return	$scope.layer.size + $scope.layer.measurement + " " + $scope.layer.size + $scope.layer.measurement + ";";
	},function(opt) {
		$scope.bgSize = opt;
		$scope.saveToCache();
	});

	$scope.$watch(function() {
		$scope.layer.gradientDirection = ($scope.layer.isRadial) ? "Radial" : "Linear";
		$scope.iconDirection = ($scope.layer.isRadial) ? "icon-radio-checked" : "icon-menu";
		$scope.displayAngle  = ($scope.layer.isRadial) ? "none" : "block";
		return $scope.layer.gradientDirection;
	},function(name) {
		$scope.nameDirection = name;
	});

	// display: btn isRepeating
	$scope.$watch(function() {
		return ($scope.layer.isRepeating) ? "Repeating - On" : "Repeating - Off";
	},function(name) {
		$scope.nameRepeating = name;
	});

	// info: add color to layer
	$scope.addColor = function() {
	 	$scope.layer.colors.push({val: "#ff0000", percentage: 100});
	 };

	// info: remove color from layer
	$scope.removeColor = function(index) {
		$scope.layer.colors.splice(index, 1);
	};

	function createGradient(colors) {
		var color = ""
			strLstColors = "",
			strColor = "";

		len = colors.length;
		for (var i=0; i<len; i++) {
			color = colors[i];
			strColor = color.val + " " + color.percentage + "%";
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
			if (lyr.gradientDirection.toLowerCase() === "linear") bg[i] += lyr.angle + "deg, ";
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
		for (var h=$scope.layers.length-1; h>=0; h--) {
			lyr = $scope.layers[h];
			strLstColors = createGradient(lyr.colors);

			// loop through different browser css prefixes
			// len = gradients.length;
 			var l = "";
			for (var i=0; i<len; i++) {

				l = gradients[i];
				if(lyr.isRepeating) l += "repeating-";
				l += lyr.gradientDirection + "-gradient( ";
				if (lyr.gradientDirection.toLowerCase() === "linear") l += lyr.angle + "deg, ";
				l += strLstColors+")";
				prefixLayer[i] = l + ";";
				if (h !== 0) l += ",";
				else l += ";";

				bg[i] = (bg[i]) ? bg[i] + l : l;
			}
			$scope.layerGradients[h] = prefixLayer.join("background: ");
		}
		$scope.cssBg = bg;
		return bg.join("background: ");
	}, function(bgImage) {
	 	$scope.bgImage = bgImage;
	 	$scope.saveToCache();
	});




	// info: change size
	$scope.sizeMinus = function() {
		$scope.layer.size--;
	}

	// info: change size
	$scope.sizePlus = function() {
		$scope.layer.size++;
	}

	// info:
	$scope.positionPlus = function(index) {
		$scope.layer.colors[index].percentage++;
	}

	// info
	$scope.positionMinus = function(index) {
		$scope.layer.colors[index].percentage--;
	}

	$scope.anglePlus = function(index) {
		$scope.layer.angle++;
	}
	$scope.angleMinus = function(index) {
		$scope.layer.angle--;
	}

	$scope.showCSS = function() {
		var css =	"background: " + this.bgImage +
					"background-size: " + this.bgSize + ";";

		document.querySelector("#control-panel").classList.toggle("flip");
	};
});

angular.bootstrap(document, ['app']);
