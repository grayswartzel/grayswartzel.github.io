// Layout helpers

function MobileLayout(colWidth) {
	// one column only

	// params
	this.vertMarginFrac = 0.13;

	// ==========

	// calculations
	this.colWidth = colWidth;

	this.imgCounter = -1;
	this.rects = [];
	this.vertMarginPx = w.f2p(this.vertMarginFrac);

	// hacky for now
	this.addOffset = function(dx, dy) {
		if (this.rects.length > 0) {
			this.rects[this.rects.length-1].x += dx;
			this.rects[this.rects.length-1].y += dy;
		}
	}

	this.getImagePosition = function(imgW, imgH) {

	  	// Increment the counters
	  	this.imgCounter += 1;

	  	// Create the variables that will be output
	  	var x, y, w, h;

	  	// Set the final width and height
	  	w = imgW;
	  	h = imgH;
	  	// Adjust to fit within the column
	  	var mult = this.colWidth / imgW;
	  	w *= mult;
  		h *= mult;

	  	// Find the x location
	  	x = 0;

	  	// now find the y location
	  	y = 0;
	  	if (this.rects.length > 0) {
	  		y = this.rects[this.rects.length-1].b() + this.vertMarginPx;
	  	}

	  	// now save and output
	  	var outRect = new rect(x, y, w, h)

	  	this.rects.push(outRect);

	  	return outRect;
	};
}

function DesktopLayout(nCols, colWidth, colMargin, indexOffset) {

    this.nCols = nCols;
    this.colWidth = colWidth;
    this.colMargin = colMargin;
    this.indexOffset = indexOffset;

    // Define a few global variables
    this.imgCounter = -1;
    this.rects = [];


    // ===== Parameters ======

    this.maxLandscapeMult = 1.5; // mult of the col radius

    this.maxIters = 1;
    this.nSamples = 10;
    this.searchRadiusMult = 1.8; // mult of the col radius // increase this if they start to stick

    // Inhibitors 
    // 1 = full inhibition
    this.intersectionInhibitor = 1;
    this.containmentInhibitor = 1; 
    this.edgeStDevMult = 0.05; // as a function of column width

    // Bounds on acceptable amounts of white space
    this.spaceLoMeanMult = 0.1;
    this.spaceLoStdevMult = 0.01;
    this.spaceHiMeanMult = 1.85; // If images start to stack, increase this
    this.spaceHiStdevMult = 0.1;

    // amount of intersection to set 
    this.intersectionThreshold = 0.5;


    // ===== Calculations ======

    this.edgeStDevPx = this.edgeStDevMult * this.colWidth;
    this.spaceLoMeanPx = this.spaceLoMeanMult * this.colWidth;
    this.spaceLoStdevPx = this.spaceLoStdevMult * this.colWidth;
    this.spaceHiMeanPx = this.spaceHiMeanMult * this.colWidth;
    this.spaceHiStdevPx = this.spaceHiStdevMult * this.colWidth;


    // Get the likelihood of a specific rectangle given existing rectangles
    this.getLikelihood = function(thisRect) {

    	// console.log("Rectangle: ", thisRect);

	  	like = 1;

	  	// Anything off the edge of the page is unacceptable
	  	if (thisRect.y < 0) {
	  		// like *= 0;
	  		// console.log("\toff page ", like);
	  	}

	  	// Intersecting images are not likely
	  	for (var i = 0; i < this.rects.length; i++) {
	  		if (this.rects[i].intersects(thisRect)) {
	  			like *= (1 - this.intersectionInhibitor);
	  			// console.log("\tIntersecting rect ", like);
	  			break;
	  		}
	  	}

	  	// Images contained within each other vertically are not likely
	  	// todo: only check the most recent ones
	  	for (var i = 0; i < this.rects.length; i++) {
	  		if ( this.rects[i].inx(thisRect, "AandB", 1, "self") == 1 || thisRect.inx(this.rects[i], "AandB", 1, "self") == 1 ) {
	  			like *= (1 - this.containmentInhibitor);
	  			// console.log("\tContained image ", like);
	  			break;
	  		}
	  	}

	  	// Don't let edges of neighboring images come close
	  	// Calculate the likelihood for all edges of last 2 images
	  	// todo: make faster by checking distances
	  	var calcLast = 2;
		for (var i = Math.max(this.rects.length-1,-1); i >= Math.max(this.rects.length-1-calcLast,0); i--) {

			// compare tops and bottoms
			like *= (1 - gaussian(this.rects[i].y, thisRect.y, this.edgeStDevPx, true));
			like *= (1 - gaussian(this.rects[i].y, thisRect.b(), this.edgeStDevPx, true));
			like *= (1 - gaussian(this.rects[i].b(), thisRect.y, this.edgeStDevPx, true));
			like *= (1 - gaussian(this.rects[i].b(), thisRect.b(), this.edgeStDevPx, true));
			// console.log("\tEdges ", like);
	  	}	  	
	  	
	  	// Impose bounds on the largest and smallest amount of white space
	  	// First, find the distance to the nearest image
	  	var bottom = 0;
	  	for (var i = Math.max(this.rects.length-1, -1); i >= 0; i--) {
	  		if (this.rects[i].inx(thisRect, "AandB", 0, "self") >= this.intersectionThreshold) {
	  			// rectangles are stacked
	  			bottom = this.rects[i].b();
	  			// console.log("\tWhite bounds ", like);
	  			break;
	  		}
	  	}

	  	// Apply the inhibitors
	  	var diff = thisRect.y - bottom;
	  	// Lower bound on the white space
		// (This allows for adjustable attenuation on the top most posts)
		var lowBoundAttenuation = (bottom==0) ? 0.01 : 1.0;
	  	like *= (1 - lowBoundAttenuation*logisticSimple(diff, this.spaceLoMeanPx, this.spaceLoStdevPx, false));


	  	// Higher bound on the white space
	  	like *= (1 - logisticSimple(diff, this.spaceHiMeanPx, this.spaceHiStdevPx, true));


	  	// If an image has no neighbors above, push it higher upwards


	  	// If there has been a lot of overlap, make room with some white space (?)



	  	return like;
	};


 	// Return a rect describing the image location within the column matrix
 	this.getImagePosition = function(imgW, imgH) {

 		// console.log("New Position");

	  	// Increment the counters
	  	this.imgCounter += 1;

	  	// Create the variables that will be output
	  	var x, y, w, h;

	  	// Set the final width and height
	  	w = imgW;
	  	h = imgH;
	  	// Adjust to fit within the column
	  	var mult = this.colWidth / imgW;
	  	if (w/h > 1.01) {
	  		// If the image is landscape, increase its width so the
	  		// area is more reasonably comparable
	  		mult *= this.maxLandscapeMult;
	  	}
	  	w *= mult;
  		h *= mult;

	  	// Find the x location
	  	var col = (this.imgCounter + this.indexOffset) % this.nCols;
	  	x = col * (this.colWidth + this.colMargin);
	  	if (w > this.colWidth) {

	  		// If the image is on the right, switch it
	  		// If the image is in the middle, randomly choose a side
	  		if (col == (this.nCols - 1) || (col > 0 && Math.random() < 0.5) ) {
	  			x -= (w-this.colWidth);
	  		}
	  	}

	  	var iters = 0
	  	var center = 0;
  		if (this.rects.length != 0) {
  			var lastRect = this.rects[this.rects.length-1];
  			center = lastRect.y + lastRect.h;
  		}
	  	var radius = this.searchRadiusMult * this.colWidth;
	  	while (iters <= this.maxIters && this.rects.length != 0) { // only complete if not first rect

	  		// Choose n samples and find the likelihood at each
	  		// The radius is relative to the last offset
	  		var searchRadius = (this.searchRadiusMult * this.colWidth) * Math.pow(0.25, iters)
	  		var yLo = center - searchRadius;
	  		var yHi = center + searchRadius;
	  		var yLocs = rangeVals(yLo, yHi, this.nSamples);

	  		// For each location, find the overall likelihood
	  		var likes = []
	  		var self = this;
	  		var loLikelihood = 1;
	  		var hiLikelihood = 0;
	  		$.each(yLocs, function(index, element) {

	  			// Add the likelihood
	  			var thisRect = new rect(x, element, w, h);
	  			var thisLike = self.getLikelihood( thisRect );
	  			likes.push( [ thisRect, thisLike ]);

	  			if (thisLike > hiLikelihood) hiLikelihood = thisLike;
	  			if (thisLike < loLikelihood) loLikelihood = thisLike;
	  		});

	  		// Sometimes, likelihoods are within less than a percent of each other. In these
	  		// situations, where they are nearly indistinguishable, choose the rectangle
	  		// higher up on the page.
	  		var likelihoodTopSimilarityRange = 0.05; // fraction of top values that become indistinguishable
	  		var maxAcceptableLikelihood = hiLikelihood-(hiLikelihood - loLikelihood)*likelihoodTopSimilarityRange;
	  		// console.log(maxAcceptableLikelihood);
	  		for (var i = 0; i < likes.length; i++) {
	  			likes[i][1] = Math.min(likes[i][1], maxAcceptableLikelihood);
	  		}


	  		// Sort to find the highest likelihood
	  		// THIS WAS CHANGED IN LATER OCTOBER. a[1] < b[1] used to work but doesn't anymore
			likes = likes.sort( function(a,b) { return b[1] - a[1]; } );

	  		// console.log(likes);

			// Save the y value of the highest rated location
			center = likes[0][0].y

			// increment the iteration
	  		iters += 1;
	  	}
	  	y = center;
	  	var outRect = new rect(x, y, w, h)

	  	this.rects.push(outRect);

	  	return outRect;
	};	

	// Add an offset afterwards
	this.addOffset = function(dx, dy) {
		if (this.rects.length > 0) {
			this.rects[this.rects.length-1].x += dx;
			this.rects[this.rects.length-1].y += dy;
		}
	}
};