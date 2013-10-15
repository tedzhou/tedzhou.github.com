document.body.addEventListener('touchmove', function (e) {
	// this prevents native scrolling from happening.
	e.preventDefault();
}, false);

var raf = window.webkitRequestAnimationFrame || window.requestAnimationFrame || function (cb) {
	setTimeout(cb, 16.6)
};

var Scroller = function (element) {
	this.element = element;
	this.startTouchY = 0;
	this.animateTo(0);

	this.refresh();

	element.addEventListener('touchstart', this, false);
	element.addEventListener('touchmove', this, false);
	element.addEventListener('touchend', this, false);
};

Scroller.prototype.refresh = function () {
	this.scrollerHeight = document.querySelector('.SCROLLER').clientHeight;
	this.frameHeight = document.querySelector('.SCROLLER_FRAME').clientHeight;
};

Scroller.prototype.handleEvent = function (e) {
	switch (e.type) {
		case 'touchstart':
			this.onTouchStart(e);
			break;
		case 'touchmove':
			this.onTouchMove(e);
			break;
		case 'touchcancel':
		case 'touchend':
			this.onTouchEnd(e);
			break;
	}
};

Scroller.prototype.onTouchStart = function (e) {
	console.log('onTouchStart');

	this.stopMomentum();

	this.startTouchY = e.touches[0].clientY;
	this.contentStartOffsetY = this.contentOffsetY;
	this.startTime = new Date();
};

Scroller.prototype.onTouchMove = function (e) {
	console.log('onTouchMove');
	if (this.isDragging()) {
		var currentY = e.touches[0].clientY;
		var deltaY = currentY - this.startTouchY;
		var newY = deltaY + this.contentStartOffsetY;
		this.animateTo(newY);
	}
};

Scroller.prototype.onTouchEnd = function () {
	console.log('onTouchEnd');
	this.endTime = new Date();
	if (this.isDragging()) {
		if (this.shouldStartMomentum()) {
			this.doMomentum();
		} else {
			this.snapToBounds();
		}
	}
};

Scroller.prototype.animateTo = function (offsetY) {
	this.contentOffsetY = offsetY;

	// we use webkit-transforms with translate3d because these animations will be hardware accelerated, and thereofre significantly faster than changeing the top value.
	var self = this;
	raf(function () {
		self.element.style.webkitTransform = 'translate3d(0, ' + offsetY + 'px, 0)';
	});
	console.log('animateTo' + ':' + offsetY);
};

// You need to measure the current position of the scrollable content
// relative to the frame. if the content is outside of the boundaries then simply
// reposition it tp be just within the appropriate boundary
Scroller.prototype.snapToBounds = function () {

	if (this.isOverTopBound) {
		this.animateTo(0)
	} else if (this.isOverBottomBound) {
		this.animateTo(-(this.scrollerHeight - this.frameHeight));
	}
};

// you need to consider whether their touch has moved past a certain threshlod that shuold be considered 'dragging'
Scroller.prototype.isDragging = function () {
	// 暂时全是true
	console.log('isDragging');
	return true;
};

// you need to consider the end velocity of the drag was past the threshold required to initiate
Scroller.prototype.shouldStartMomentum = function () {
	this.isOverTopBound = (this.contentOffsetY > 0);
	this.isOverBottomBound = ((this.scrollerHeight + this.contentOffsetY) < this.frameHeight);

	var overBound = this.isOverTopBound || this.isOverBottomBound;

	console.log('shouldStartMomentum' + ':' + overBound);
	return !overBound;
};

Scroller.prototype.doMomentum = function () {
	// Calculate the movement properties.
	// Implement getEndVelocity using the start and end position / time
	var maxDisplacement = -(this.contentOffsetY);
	var minDisplacement = -(this.scrollerHeight - this.frameHeight + this.contentOffsetY);

	var velocity = this.getEndVelocity();
	var acceleration = velocity < 0 ? 0.0005 : -0.0005;
	var displacement = -(velocity * velocity) / (2 * acceleration);
	if (displacement > maxDisplacement) {
		displacement = maxDisplacement;
	}
	if (displacement < minDisplacement) {
		displacement = minDisplacement;
	}

//	var displacement = maxDisplacement;
	var time = -velocity / acceleration;
	var self = this;
	raf(function () {

		self.element.style.webkitTransition = '-webkit-transform ' + time + 'ms cubic-bezier(0.33, 0.66, 0.66 ,1)';

		var newY = self.contentOffsetY + displacement;
		self.contentOffsetY = newY;
		self.element.style.webkitTransform = 'translate3d(0,' + newY + 'px, 0)';
		console.log('doMomentum');
	});
};

Scroller.prototype.getEndVelocity = function () {
	var velocity = (this.contentOffsetY - this.contentStartOffsetY) / (this.endTime - this.startTime);
	console.log('getEndVelocity' + ':' + velocity);
	return velocity;

};

Scroller.prototype.stopMomentum = function () {
	console.log('stopMomentum');
	if (this.isDecelerating()) {
		var style = document.defaultView.getComputedStyle(this.element, null);
		var transform = new WebKitCSSMatrix(style.webkitTransform);
		this.element.style.webkitTransition = '';
		this.animateTo(transform.m42);
	}
};

Scroller.prototype.isDecelerating = function () {
	console.log('isDecelerating');
	return true;
};