LibCanvas.Animation = new Class({
	Implements : [LibCanvas.Interfaces.Bindable],

	sprites : {},
	addSprite : function (index, sprite) {
		this.sprites[index] = sprite;
		return this;
	},
	addSprites : function (sprites) {
		$extend(this.sprites, sprites);
		return this;
	},
	defaultSprite : null,
	setDefaultSprite : function (index) {
		this.defaultSprite = index;
		return this;
	},
	getSprite : function () {
		return this.getFrame() ? this.sprites[this.getFrame().sprite] : 
			$chk(this.defaultSprite) ? this.sprites[this.defaultSprite] : null;
	},

	animations : {},
	add : function (animation) {
		this.animations[animation.name] = animation;
		return this;
	},

	current : null,
	queue : [],
	run : function (name, cfg) {
		if (!name in this.animations) {
			throw 'No animation "' + name + '"';
		}
		var args = {
			name : name,
			cfg  : cfg || {}
		};
		if (this.current) {
			this.queue.push(args);
		} else {
			this.init(args);
		}
		return this;
	},
	stop : function (force) {
		this.current = null;
		if (force) {
			this.queue = [];
		} else {
			this.stopped();
		}
		return this;
	},
	stopped : function () {
		var next = this.queue.shift();
		return $chk(next) && this.init(next);
	},
	init : function (args) {
		this.current = {
			animation : this.animations[args.name],
			index     : -1,
			cfg       : args.cfg
		};
		this.current.repeat = this.getCfg('repeat');
		return this.nextFrame();
	},
	nextFrame : function () {
		if (!this.current) {
			return this;
		}
		this.current.index++;
		var frame = this.getFrame();
		if (!frame && (this.getCfg('loop') || this.current.repeat)) {
			this.current.repeat && this.current.repeat--;
			this.current.index = 0;
			frame = this.getFrame();
		}
		var aniName = this.current.animation.name;
		if (frame) {
			var frameName = frame.name ? 'frame:' + frame.name : 'frame';
			this.bind('changed', [frameName, aniName]);
			this.bind(frameName, [frameName, aniName]);
			$chk(frame.delay) && this.nextFrame.bind(this).delay(frame.delay);
		} else {
			this.bind('changed', ['stop:' + aniName]);
			this.bind('stop:' + aniName, ['stop:' + aniName]);
			this.bind('stop', [aniName]);
			this.current = null;
			this.stopped();
		}
		return this;
	},
	getFrame : function () {
		return !this.current ? null :
			this.current.animation.frames[this.current.index];
	},
	getCfg : function (index) {
		if (index in this.current.cfg) {
			return this.current.cfg[index];
		} else {
			return this.current.animation[index]
		}
	}
});