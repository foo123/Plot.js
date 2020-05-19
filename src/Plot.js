/**
*   Plot.js, version 1.0.0
*   Simple shape sketching and chart / functional graph plotting library which can render to Canvas, SVG and plain HTML
*   https://github.com/foo123/Plot.js
**/
!function( root, name, factory ){
"use strict";
    if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          'undefined' !== typeof self ? self : this,
    /* module name */           "Plot",
    /* module factory */        function ModuleFactory__Plot( undef ){
"use strict";

var stdMath = Math, PROTO = 'prototype', EPS = 1e-6, SPC = /\s+/,
    HAS = Object[PROTO].hasOwnProperty, toString = Object[PROTO].toString;

if ( !stdMath.hypot )
{
    stdMath.hypot = function(x, y) {
        // https://bugzilla.mozilla.org/show_bug.cgi?id=896264#c28
        var max = 0, s = 0, i, arg;
        for (i = 0; i < arguments.length; i += 1)
        {
            arg = stdMath.abs(Number(arguments[i]));
            if (arg > max)
            {
                s *= (max / arg) * (max / arg);
                max = arg;
            }
            s += arg === 0 && max === 0 ? 0 : (arg / max) * (arg / max);
        }
        return max === 1 / 0 ? 1 / 0 : max * stdMath.sqrt(s);
    };
}

function err( msg )
{
    return function( ) {
        throw new Error(msg||'Error');
    };
}
function typeOf( x )
{
    return toString.call(x).slice(8, -1);
}
function is_array( x )
{
    return 'Array' === typeOf(x);
}
function is_obj( x )
{
    return 'Object' === typeOf(x);
}
function is_callable( x )
{
    return 'function' === typeof x;
}
function is_finite( n )
{
    return !isNaN(n) && isFinite(n);
}
function clone( o )
{
    var co = {}, k;
    for(k in o)
    {
        if ( !HAS.call(o, k) ) continue;
        if ( is_obj(o[k]) )
            co[k] = clone(o[k]);
        else
            co[k] = o[k];
    }
    return co;
}
function extend( /*args*/ )
{
    var args = arguments, len = args.length,
        recursive = len ? (true === args[0]) : false,
        i0 = recursive ? 1 : 0,
        o = (len>i0 ? args[i0] : {}) || {}, o2, i, k;
    for(i=i0+1; i<len; i++)
    {
        o2 = args[i];
        for(k in o2)
        {
            if ( !HAS.call(o2, k) ) continue;
            if ( recursive && is_obj(o[k]) && is_obj(o2[k]) )
                o[k] = extend(true, o[k], o2[k]);
            else
                o[k] = o2[k];
        }
    }
    return o;
}
function debounce( fn, delay )
{
    var timer = null;
    return function( ) {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}
function nextRGB( rgb )
{
    if ( rgb )
    {
        if ( 255 > rgb[2] ) return [rgb[0], rgb[1], rgb[2]+1];
        else if ( 255 > rgb[1] ) return [rgb[0], rgb[1]+1, 0];
        else if ( 255 > rgb[0] ) return [rgb[0]+1, 0, 0];
    }
    return [0, 0, 0];
}
function hex2rgb( hex )
{
    hex = parseInt( '#'===hex.charAt(0) ? hex.slice(1) : hex, 16 );
    return [((hex >> 16) & 255), ((hex >> 8) & 255), (hex & 255)];
}
function rgb2hex( rgb )
{
    var hex = [
        Number(rgb[0]).toString(16),
        Number(rgb[1]).toString(16),
        Number(rgb[2]).toString(16)
    ];
    if ( 1 === hex[0].length ) hex[0] = '0' + hex[0];
    if ( 1 === hex[1].length ) hex[1] = '0' + hex[1];
    if ( 1 === hex[2].length ) hex[2] = '0' + hex[2];
    return hex[0]+hex[1]+hex[2];
}
function hsb2rgb( hsb )
{
    var r, g, b,
        h = stdMath.round( hsb[0] ),
        s = stdMath.round( hsb[1]*255/100 ),
        v = stdMath.round( hsb[2]*255/100 )
    ;
    if ( s === 0 )
    {
        r = g = b = v;
    }
    else
    {
        var t1 = v,
            t2 = (255-s)*v/255,
            t3 = (t1-t2)*(h%60)/60
        ;
        if ( h == 360 ) h = 0;
        if ( h < 60 ) { r=t1; b=t2; g=t2+t3 }
        else if ( h < 120 ) { g=t1; b=t2; r=t1-t3 }
        else if ( h < 180 ) { g=t1; r=t2; b=t2+t3 }
        else if ( h < 240 ) { b=t1; r=t2; g=t1-t3 }
        else if ( h < 300 ) { b=t1; g=t2; r=t2+t3 }
        else if ( h < 360 ) { r=t1; g=t2; b=t1-t3 }
        else { r=0; g=0; b=0 }
    }
    return [stdMath.round(r), stdMath.round(g), stdMath.round(b)];
}
function rgb2hsb( rgb )
{
    var h = 0, s = 0, b = 0,
        rr = rgb[0], rg = rgb[1], rb = rgb[2],
        min = stdMath.min( rr, rg, rb ), max = stdMath.max( rr, rg, rb ),
        delta = max - min
    ;
    b = max;
    if ( max != 0 ) { }
    s = max != 0 ? 255 * delta / max : 0;
    if ( s != 0 )
    {
        if ( rr === max )
            h = (rg - rb) / delta;
        else if ( rg === max )
            h = 2 + (rb - rr) / delta;
        else
            h = 4 + (rr - rg) / delta;
    }
    else
    {
        h = -1;
    }
    h *= 60;
    if ( h < 0 ) h += 360;
    s = s*100/255;
    b = b*100/255;
    return [stdMath.round(h), stdMath.round(s), stdMath.round(b)];
}
function palette( n, format )
{
    format = String(format || 'hex').toLowerCase();
    var colors = new Array(n), m = stdMath.min(n, 60), i, k, c;
    for(i=0,k=0; i<n; i++)
    {
        c = hsb2rgb([k*360/m, 100, 100]);
        colors[i] = 'rgb' === format ? ('rgb('+c.join(',')+')') : ('#'+rgb2hex(c));
        k += 2;
        if ( k >= m ) k = k&1 ? 0 : 1;
    }
    return colors;
}
function labels( n )
{
    var lbls = new Array(n), i;
    for(i=0; i<n; i++)
        lbls[i] = 'Entry: '+String(i+1);
    return lbls;
}
function lin( x )
{
    return x;
}
function log( x )
{
    return stdMath.log10(x);
}
function X( pt )
{
    return pt.x;
}
function Y( pt )
{
    return pt.y;
}
function YH( height )
{
    return function( pt ) {
        if ( "number" === typeof pt ) return height-pt;
        pt.y = height-pt.y;
        return pt;
    };
}
function interpolate( a, b, t, extended )
{
    t = t || 0;
    return true===extended ? (a + t*(b-a)) : (0 > t ? a : (1 < t ? b : (a + t*(b-a))));
}
function arc( center, radius )
{
    if ( 'number' === typeof radius ) radius = {x:radius, y:radius};
    return {
        x: function( t ) { return center.x+radius.x*stdMath.cos(t); },
        y: function( t ) { return center.y+radius.y*stdMath.sin(t); },
    };
}
function bezier( points )
{
    // cubic bezier
    return 4 <= points.length ? function( t ) {
        // only up to cubic bezier
       var t0 = t, t1 = 1-t, t0t0 = t0*t0, t1t1 = t1*t1;
       return t1*t1t1*points[0]+3*t1t1*t0*points[1]+3*t1*t0t0*points[2]+t0t0*t0*points[3];
    } : (3 === points.length ? function( t ) {
        // quadratic bezier
       var t0 = t, t1 = 1-t, t0t0 = t0*t0, t1t1 = t1*t1;
       return t1t1*points[0]+2*t1*t0*points[1]+t0t0*points[2];
    } : (2 === points.length ? function( t ) {
        // linear bezier
        return (1-t)*points[0]+t*points[1];
    } : function( t ) {
        // single point
        return points[0] || 0;
    }));
}
function bezierControlPoints( knots )
{
    var i, p1, p2, a, b, c, r, m, n = knots.length-1;
    p1 = new Array(n);
    p2 = new Array(n);

    /*rhs vector*/
    a = new Array(n);
    b = new Array(n);
    c = new Array(n);
    r = new Array(n);

    /*left most segment*/
    a[0] = 0;
    b[0] = 2;
    c[0] = 1;
    r[0] = knots[0] + 2*knots[1];

    /*internal segments*/
    for(i=1; i<n-1; i++)
    {
        a[i] = 1;
        b[i] = 4;
        c[i] = 1;
        r[i] = 4*knots[i] + 2*knots[i+1];
    }

    /*right segment*/
    a[n-1] = 2;
    b[n-1] = 7;
    c[n-1] = 0;
    r[n-1] = 8*knots[n-1] + knots[n];

    /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
    for(i=1; i<n; i++)
    {
        m = a[i] / b[i-1];
        b[i] = b[i] - m*c[i - 1];
        r[i] = r[i] - m*r[i-1];
    }

    p1[n-1] = r[n-1] / b[n-1];
    for(i=n-2; i>=0; --i)
        p1[i] = (r[i]-c[i]*p1[i+1]) / b[i];

    /*we have p1, now compute p2*/
    for (i=0;i<n-1;i++)
        p2[i] = 2*knots[i+1] - p1[i+1];
    p2[n-1] = (knots[n]+p1[n-1])/2;

    return [p1, p2];
}
function bezierThrough( knots )
{
    // piecewise cubic bezier segments passing through given knot points
    var i, points, segments;
    if ( 2 >= knots.length )
    {
        segments = [knots];
    }
    else
    {
        segments = [];
        points = bezierControlPoints(knots);
        for(i=0; i<knots.length-1; i++)
            segments.push([knots[i], points[0][i], points[1][i], knots[i+1]]);
    }
    return segments;
}

function m( v )
{
    return stdMath.hypot(v[0], v[1]);
}
function r( u, v )
{
    return (u[0]*v[0]+u[1]*v[1])/(m(u)*m(v));
}
function ang( u, v )
{
    return (u[0]*v[1]<u[1]*v[0] ? -1 : 1)*stdMath.acos(r(u,v));
}
function svgArc2canvasArc( start, radius, xAxisRotation,
                            largeArcFlag, sweepFlag, end )
{
    // https://stackoverflow.com/questions/6729056/mapping-svg-arcto-to-html-canvas-arcto
    //--------------------
    // rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y
    // are the 6 data items in the SVG path declaration following the A
    //
    // lastX and lastY are the previous point on the path before the arc
    //--------------------

    xAxisRotation = xAxisRotation*stdMath.PI/180;
    var sax = stdMath.sin(xAxisRotation), cax = stdMath.cos(xAxisRotation),
        currpX = (cax*(start.x-end.x)+sax*(start.y-end.y))/2.0,
        currpY = (-sax*(start.x-end.x)+cax*(start.y-end.y))/2.0,
        rx = radius.x, ry = radius.y, l, ls, s, cppX, cppY, rx2, ry2, cX2, cY2,
        centpX, centpY, ang1, a, b, angd, rad, sx, sy, rab
    ;

    cX2 = stdMath.pow(currpX, 2); cY2 = stdMath.pow(currpY, 2);
    rx2 = stdMath.pow(rx, 2); ry2 = stdMath.pow(ry, 2);
    l = cX2/rx2 + cY2/ry2;

    if ( l > 1 )
    {
        ls = stdMath.sqrt(l);
        rx *= ls; ry *= ls;
    }

    rx2 = stdMath.pow(rx, 2); ry2 = stdMath.pow(ry, 2);
    s = (largeArcFlag == sweepFlag ? -1 : 1) * stdMath.sqrt((rx2*ry2 - rx2*cY2 - ry2*cX2) / (rx2*cY2 + ry2*cX2));

    if ( isNaN(s) ) s = 0;

    cppX = s*rx*currpY/ry;
    cppY = s*(-ry)*currpX/rx ;
    centpX = (start.x+end.x)/2.0 + cax*cppX - sax*cppY;
    centpY = (start.y+end.y)/2.0 + sax*cppX + cax*cppY;

    ang1 = ang([1,0], [(currpX-cppX)/rx,(currpY-cppY)/ry]);
    a = [(currpX-cppX)/rx,(currpY-cppY)/ry];
    b = [(-currpX-cppX)/rx,(-currpY-cppY)/ry];
    angd = ang(a, b); rab = r(a, b);
    if ( rab <= -1 ) angd = stdMath.PI;
    if ( rab >=  1 ) angd = 0;

    rad = rx > ry ? rx : ry;
    sx  = rx > ry ? 1 : rx/ry;
    sy  = rx > ry ? ry/rx : 1;

    return [centpX, centpY, xAxisRotation, sx, sy, rad, ang1, angd, sweepFlag];
}
/*function canvasArc2svgArc( center, radius, a0, a1, ccw )
{
    var pi = stdMath.PI,
        tau = 2 * pi,
        epsilon = EPS, //1e-6
        tauEpsilon = tau - epsilon,
        dx = radius * stdMath.cos(a0),
        dy = radius * stdMath.sin(a1),
        cw = ccw ? 0 : 1,
        da = ccw ? a0 - a1 : a1 - a0,
        start, rad, end
    ;

    start = {x:center.x+dx, y:center.y+dy};
    rad = {x:radius, y:radius};

    // Does the angle go the wrong way? Flip the direction.
    if ( da < 0 ) da = (da % tau) + tau;

    // Is this a complete circle? Draw two arcs to complete the circle.
    if ( da > tauEpsilon )
    {
        end = {x:center.x-dx, y:center.y-dy};
        return [
            [start, rad, 0, 1, cw, end],
            [end, rad, 0, 1, cw, start]
        ];
    }
    else
    {
        // draw single arc
        end = {x:center.x+radius*stdMath.cos(a1), y:center.x+radius*stdMath.sin(a1)};
        return [[start, rad, 0, da >= pi, cw, end]];
    }
}*/

function subdividePath( f, l, r, tolerance, depth, pl, pr )
{
    var self = this, m = (l + r) / 2,
        left = pl || new Point(f.x(l), f.y(l)),
        right = pr || new Point(f.x(r), f.y(r)),
        middle = new Point(f.x(m), f.y(m))
    ;
    if ( (0 >= depth) || (middle.dist(left, right) <= tolerance) )
    {
        // no more refinement, return linear interpolation
        // simple line segment, include middle as well for better accuracy
        return left.eq(middle) || right.eq(middle) ? [left, right] : [left, middle, right];
    }
    else
    {
        // recursively subdivide to refine samples with high enough curvature
        return subdividePath(f, l, m, tolerance, depth-1, left, middle).concat(
            subdividePath(f, m, r, tolerance, depth-1, middle, right).slice(1)
        );
    }
}
function getMousePos( el, evt )
{
    evt = evt || window.event;
    var rect = el.getBoundingClientRect( ),
        /*offset = {
            left: el.offsetLeft,
            top: el.offsetTop,
            width: el.offsetWidth,
            height: el.offsetHeight,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop
        },*/
        borderLeftWidth = 0, borderTopWidth = 0,
        clientX, clientY, pageX, pageY, left, top
    ;

    if ( evt.changedTouches && evt.changedTouches.length )
    {
        clientX = evt.changedTouches[0].clientX;
        clientY = evt.changedTouches[0].clientY;
        pageX = evt.changedTouches[0].pageX;
        pageY = evt.changedTouches[0].pageY;
    }
    else
    {
        clientX = evt.clientX;
        clientY = evt.clientY;
        pageX = evt.pageX;
        pageY = evt.pageY;
    }
    left = clientX - borderLeftWidth - rect.left;
    top = clientY - borderTopWidth - rect.top;

    /*if ( left < 0 ) left = 0;
    else if ( left >= offset.width ) left = offset.width-1;
    if ( top < 0 ) top = 0;
    else if ( top >= offset.height ) top = offset.height-1;*/

    return {
        top: top, left: left,
        clientX: clientX, clientY: clientY,
        pageX: pageX, pageY: pageY
    };
}

function Point( x, y )
{
    var self = this;
    if ( !(self instanceof Point) ) return new Point(x, y);
    if ( x instanceof Point )
    {
        self.x = x.x;
        self.y = x.y;
    }
    else if ( null != x && null != y )
    {
        self.x = x;
        self.y = y;
    }
    else
    {
        self.x = 0;
        self.y = 0;
    }
}
Point[PROTO] = {
    constructor: Point

    ,x: 0
    ,y: 0

    ,dispose: function( ) {
        var self = this;
        self.x = null;
        self.y = null;
        return self;
    }

    ,eq: function( other, eps ) {
        var self = this;
        if ( 2 <= arguments.length ) return stdMath.hypot(self.x-other.x, self.y-other.y) <= (eps || 0);
        return (self.x===other.x) && (self.y===other.y);
    }

    ,dist: function( p1, p2 ) {
        var p0 = this, dx = p2.x-p1.x, dy = p2.y-p1.y;
        return stdMath.abs(dy*p0.x-dx*p0.y+p2.x*p1.y-p2.y*p1.x) / stdMath.hypot(dy, dx);
    }

    ,apply: function( fx, fy ) {
        var self = this;
        if ( null == fy ) fy = fx;
        return fx instanceof Matrix ? fx.transform(self) : (is_callable(fx) && is_callable(fy) ? new Point(fx(self.x), fy(self.y)) : self);
    }
};
Point.isFinite = function( pt ) {
    return is_finite(pt.x) && is_finite(pt.y);
};

function Matrix( v )
{
    var self = this;
    if ( !(self instanceof Matrix) ) return new Matrix(v);
    if ( v instanceof Matrix )
    {
        self.v = v.v.slice();
    }
    else if ( v && (9 === v.length) )
    {
        self.v = v;
    }
    else
    {
        self.v = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
        ];
    }
}
Matrix[PROTO] = {
    constructor: Matrix

    ,v: null

    ,dispose: function( ) {
        var self = this;
        self.v = null;
        return self;
    }

    ,eq: function( other ) {
        var m1 = this.v, m2 = other.v, i;
        for(i=0; i<9; i++)
        {
            if ( m1[i] !== m2[i] )
                return false;
        }
        return true;
    }

    ,mul: function( other ) {
        var self = this, m = self.v, m2, x, y;
        if ( (other instanceof Point) || (HAS.call(other, 'x') && HAS.call(other, 'y')) )
        {
            x = other.x; y = other.y;
            return new Point(
            m[0]*x+m[1]*y+m[2],
            m[3]*x+m[4]*y+m[5]
            );
        }
        else if ( other instanceof Matrix )
        {
            m2 = other.v;
            return new Matrix([
            m[0]*m2[0]+m[1]*m2[3]+m[2]*m2[6], m[0]*m2[1]+m[1]*m2[4]+m[2]*m2[7], m[0]*m2[2]+m[1]*m2[5]+m[2]*m2[8],
            m[3]*m2[0]+m[4]*m2[3]+m[5]*m2[6], m[3]*m2[1]+m[4]*m2[4]+m[5]*m2[7], m[3]*m2[2]+m[4]*m2[5]+m[5]*m2[8],
            m[6]*m2[0]+m[7]*m2[3]+m[8]*m2[6], m[6]*m2[1]+m[7]*m2[4]+m[8]*m2[7], m[6]*m2[2]+m[7]*m2[5]+m[8]*m2[8]
            ]);
        }
        else
        {
            return self;
        }
    }

    ,skew: function( sx, sy ) {
        return new Matrix([
            1, sx||0, 0,
            sy||0, 1, 0,
            0, 0, 1
        ]).mul(this);
    }

    ,scale: function( sx, sy ) {
        if ( 1 === arguments.length ) sy = sx;
        return new Matrix([
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1
        ]).mul(this);
    }

    ,rotate: function( theta ) {
        theta = theta || 0;
        var s = stdMath.sin(theta), c = stdMath.cos(theta);
        return new Matrix([
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]).mul(this);
    }

    ,translate: function( tx, ty ) {
        return new Matrix([
            1, 0, tx||0,
            0, 1, ty||0,
            0, 0, 1
        ]).mul(this);
    }

    ,transform: function( point ) {
        return this.mul(point);
    }
};

function Renderer( container, opts )
{
    // abstract
}
Renderer[PROTO] = {
    constructor: Renderer
    ,container: null
    ,opts: null
    ,drawLayer: null
    ,nextColor: null
    ,hitDict: null
    ,hitTarget: null
    ,handler: null
    ,dispose: function( ) {
        var self = this;
        if ( self.container && self.drawLayer )
        {
            if ( self.handler )
            {
                self.drawLayer.removeEventListener('touchstart', self.handler, false);
                self.drawLayer.removeEventListener('mouseenter', self.handler, false);
                self.drawLayer.removeEventListener('click', self.handler, false);
            }
            self.container.removeChild(self.drawLayer);
        }
        self.container = null;
        self.opts = null;
        self.drawLayer = null;
        self.nextColor = null;
        self.hitDict = null;
        self.hitTarget = null;
        self.handler = null;
        return self;
    }
    ,defaultOpts: function( ) {
        return {
            background: {
                color: '#ffffff'
            },
            text: {
                size: 12,
                color: '#000000'
            },
            point: {
                size: 4,
                color: '#000000'
            },
            line: {
                size: 1,
                color: '#000000',
                style: 'solid'
            },
            shape: {
                border: {
                    size: 1,
                    color: '#000000',
                    style: 'solid'
                },
                fill: 'none'
            },
            label: {
                text: {
                    size: 12,
                    color: '#000000'
                },
                border: {
                    size: 1,
                    color: '#000000',
                    style: 'solid'
                },
                fill: 'none',
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            }
        };
    }
    ,width: function( ) {
        return this.drawLayer ? this.drawLayer.clientWidth : 0;
    }
    ,height: function( ) {
        return this.drawLayer ? this.drawLayer.clientHeight : 0;
    }
    ,resize: function( ) {
        return this;
    }
    ,init: err('Method not implemented!')
    ,objAt: err('Method not implemented!')
    ,clear: err('Method not implemented!')
    ,background: err('Method not implemented!')
    ,drawPoint: err('Method not implemented!')
    ,drawLine: err('Method not implemented!')
    ,drawRect: err('Method not implemented!')
    ,drawEllipse: err('Method not implemented!')
    ,drawSector: err('Method not implemented!')
    ,drawArc: err('Method not implemented!')
    ,drawBezier: err('Method not implemented!')
    ,drawText: err('Method not implemented!')
    ,drawLabel: err('Method not implemented!')
};
Renderer.handler = function( evt ) {
    var self = this, pos, obj,
        type = evt.type, onTop = (self.drawLayer === evt.target);

    function callListener( type, obj, pos, evt )
    {
        var coords;
        if ( type && obj && obj.extra && obj.extra.listener &&
            is_callable(obj.extra.listener[type]) )
        {
            coords = {
                localX: pos.left, localY: pos.top,
                clientX: pos.clientX, clientY: pos.clientY,
                pageX: pos.pageX, pageY: pos.pageY
            };
            obj.extra.listener[type](type, obj, coords, evt);
        }
    }

    if ( onTop )
    {
        if ( 'touchstart' === type )
        {
            self.drawLayer.addEventListener('touchmove', self.handler, false);
            self.drawLayer.addEventListener('touchend', self.handler, false);
            self.drawLayer.addEventListener('touchcancel', self.handler, false);
        }
        else if ( 'touchend' === type || 'touchcancel' === type )
        {
            self.drawLayer.removeEventListener('touchmove', self.handler, false);
            self.drawLayer.removeEventListener('touchend', self.handler, false);
            self.drawLayer.removeEventListener('touchcancel', self.handler, false);
            if ( self.hitTarget )
            {
                callListener('leave', self.hitTarget.obj, self.hitTarget.pos, evt);
                self.hitTarget = null;
            }
        }
        else if ( 'mouseenter' === type )
        {
            self.drawLayer.addEventListener('mouseleave', self.handler, false);
            self.drawLayer.addEventListener('mousemove', self.handler, false);
        }
        else if ( 'mouseleave' === type )
        {
            self.drawLayer.removeEventListener('mouseleave', self.handler, false);
            self.drawLayer.removeEventListener('mousemove', self.handler, false);
            if ( self.hitTarget )
            {
                callListener('leave', self.hitTarget.obj, self.hitTarget.pos, evt);
                self.hitTarget = null;
            }
        }
    }

    if ( 'touchmove' === type || 'mousemove' === type || 'click' === type )
    {
        pos = getMousePos(self.drawLayer, evt);
        obj = self.objAt(evt, pos);
        if ( onTop && !obj ) return;
        if ( obj )
        {
            if ( self.hitTarget )
            {
                if ( self.hitTarget.obj !== obj )
                {
                    callListener('leave', self.hitTarget.obj, self.hitTarget.pos=pos, evt);
                    self.hitTarget = null;
                }
                else if ( 'click' !== type )
                {
                    callListener('move', self.hitTarget.obj, self.hitTarget.pos=pos, evt);
                }
            }
            if ( !self.hitTarget )
            {
                self.hitTarget = {obj:obj, pos:pos};
                callListener('enter', self.hitTarget.obj, self.hitTarget.pos=pos, evt);
            }
            if ( 'click' === type )
            {
                callListener('click', self.hitTarget.obj, self.hitTarget.pos=pos, evt);
            }
        }
        else if ( self.hitTarget )
        {
            callListener('leave', self.hitTarget.obj, self.hitTarget.pos=pos, evt);
            self.hitTarget = null;
        }
    }
};
Renderer.Html = function HtmlRenderer( container, opts ) {
    var self = this;
    if ( !(self instanceof HtmlRenderer) ) return new HtmlRenderer(container, opts);
    self.container = container;
    self.opts = extend(true, self.defaultOpts(), opts||{});
};
Renderer.Html[PROTO] = extend(new Renderer(), {
    constructor: Renderer.Html
    ,init: function( ) {
        var self = this;
        if ( !self.drawLayer )
        {
            self.nextColor = [0,0,0];
            self.hitDict = {};
            self.hitTarget = null;
            self.drawLayer = document.createElement('div');
            self.drawLayer.className = '--plot-html';
            self.drawLayer.style.position = 'absolute';
            self.drawLayer.style.left = '0px';
            self.drawLayer.style.top = '0px';
            self.drawLayer.style.width = '100%';
            self.drawLayer.style.height = '100%';
            self.drawLayer.style.display = 'block';
            self.drawLayer.style.overflow = 'hidden';
            self.drawLayer.style.margin = '0px';
            self.drawLayer.style.padding = '0px';
            self.drawLayer.style.border = 'none';
            self.drawLayer.style.backgroundColor = self.opts.background.color;
            self.container.appendChild(self.drawLayer);
            self.handler = Renderer.handler.bind(self);
            self.drawLayer.addEventListener('touchstart', self.handler, false);
            self.drawLayer.addEventListener('mouseenter', self.handler, false);
            self.drawLayer.addEventListener('click', self.handler, false);
        }
        return self;
    }
    ,objAt: function( evt, pos ) {
        var self = this, hitId = evt.target ? evt.target.hitId : null;
        return hitId && HAS.call(self.hitDict, hitId) ? self.hitDict[hitId] : null;
    }
    ,clear: function( ) {
        var self = this;
        self.drawLayer.innerHTML = ''; // empty
        self.nextColor = [0,0,0];
        self.hitDict = {};
        self.hitTarget = null;
        return self;
    }
    ,background: function( background ) {
        var self = this;
        self.opts.background.color = background;
        self.drawLayer.style.backgroundColor = self.opts.background.color;
        return self;
    }
    ,drawPoint: function( p, pointSize, pointColor, extra ) {
        var self = this, point = document.createElement('div');
        pointSize = null != pointSize ? pointSize : self.opts.point.size;
        pointColor = String(pointColor || self.opts.point.color).toLowerCase();
        point.className = '--plot-point';
        point.style.position = 'absolute';
        point.style.display = 'inline-block';
        point.style.overflow = 'hidden';
        point.style.boxSizing = 'border-box';
        point.style.margin = '0px';
        point.style.padding = '0px';
        point.style.width = String(2*pointSize)+'px';
        point.style.height = String(2*pointSize)+'px';
        point.style.border = '1px solid '+pointColor;
        point.style.borderRadius = '50%';
        point.style.backgroundColor = pointColor;
        point.style.left = String(p.x)+'px';
        point.style.top = String(p.y)+'px';
        point.style.transformOrigin = 'left top';
        point.style.transform = 'translate(-50%,-50%)';
        point.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[point.hitId] = {type:'point', pos:p, extra:extra||null};
        self.drawLayer.appendChild(point);
        return self;
    }
    ,drawLine: function( p1, p2, lineSize, lineColor, lineStyle, extra, hitId ) {
        var self = this, line = document.createElement('div'),
            dy = p2.y-p1.y, dx = p2.x-p1.x, dd = stdMath.hypot(dy, dx);
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        line.className = '--plot-line';
        line.style.position = 'absolute';
        line.style.display = 'inline-block';
        line.style.boxSizing = 'border-box';
        line.style.margin = '0px';
        line.style.padding = '0px';
        line.style.border = 'none';
        //line.style.backgroundColor = 'none';
        line.style.background = 'none';
        line.style.width = String(dd)+'px';
        line.style.height = '0px';
        //line.style.borderWidth = '0px 0px '+String(lineSize)+'px 0px';
        //line.style.borderStyle = 'none none '+lineStyle+' none';
        //line.style.borderColor = 'transparent transparent '+lineColor+' transparent';
        line.style.borderBottom = String(lineSize)+'px '+lineStyle+' '+lineColor;
        line.style.left = String(p1.x)+'px';
        line.style.top = String(p1.y)+'px';
        line.style.transformOrigin = 'left top';
        line.style.transform = 'rotate('+String(stdMath.atan2(dy, dx))+'rad)';
        if ( hitId )
        {
            line.hitId = hitId;
        }
        else
        {
            line.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
            self.hitDict[line.hitId] = {type:'line', pos:[p1,p2], extra:extra||null};
        }
        self.drawLayer.appendChild(line);
        return self;
    }
    ,drawRect: function( center, side, rotation, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, rect = document.createElement('div');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        rect.className = '--plot-rectangle';
        rect.style.position = 'absolute';
        rect.style.display = 'inline-block';
        rect.style.overflow = 'hidden';
        rect.style.boxSizing = 'border-box';
        rect.style.margin = '0px';
        rect.style.padding = '0px';
        rect.style.background = fill ? fill : 'none';
        rect.style.width = String(side.x)+'px';
        rect.style.height = String(side.y)+'px';
        rect.style.border = 0 < lineSize ? String(lineSize)+'px '+lineStyle+' '+lineColor : 'none';
        rect.style.left = String(center.x-side.x/2)+'px';
        rect.style.top = String(center.y-side.y/2)+'px';
        rect.style.transformOrigin = 'center center';
        rect.style.transform = 'rotate('+String((rotation||0)*stdMath.PI/180)+'rad)';
        rect.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[rect.hitId] = {type:'rect', center:center, side:side, rotation:rotation, extra:extra||null};
        self.drawLayer.appendChild(rect);
        return self;
    }
    ,drawEllipse: function( center, radius, rotation, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, ellipse = document.createElement('div');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        ellipse.className = '--plot-ellipse';
        ellipse.style.position = 'absolute';
        ellipse.style.display = 'inline-block';
        ellipse.style.overflow = 'hidden';
        ellipse.style.boxSizing = 'border-box';
        ellipse.style.margin = '0px';
        ellipse.style.padding = '0px';
        ellipse.style.background = fill ? fill : 'none';
        ellipse.style.width = String(2*radius.x)+'px';
        ellipse.style.height = String(2*radius.y)+'px';
        ellipse.style.border = 0 < lineSize ? String(lineSize)+'px '+lineStyle+' '+lineColor : 'none';
        ellipse.style.borderRadius = '50%';
        ellipse.style.left = String(center.x-radius.x)+'px';
        ellipse.style.top = String(center.y-radius.y)+'px';
        ellipse.style.transformOrigin = 'center center';
        ellipse.style.transform = 'rotate('+String((rotation||0)*stdMath.PI/180)+'rad)';
        ellipse.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[ellipse.hitId] = {type:'ellipse', center:center, radius:radius, rotation:rotation, extra:extra||null};
        self.drawLayer.appendChild(ellipse);
        return self;
    }
    ,drawSector: function( center, radius, a0, a1, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, p0, p1, da, dd, ra0, ra1,
            x0, y0, x1, y1, cx, cy, clipPath, clipPoints = [],
            sector = document.createElement('div');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        ra0 = a0*stdMath.PI/180;
        ra1 = a1*stdMath.PI/180;
        dd = 2*radius;
        da = ra1-ra0;
        cx = center.x; cy = center.y;
        x0 = cx-radius; y0 = cy-radius;
        x1 = cx+radius; y1 = cy+radius;
        sector.className = '--plot-sector';
        sector.style.position = 'absolute';
        sector.style.display = 'inline-block';
        sector.style.overflow = 'hidden';
        sector.style.boxSizing = 'border-box';
        sector.style.margin = '0px';
        sector.style.padding = '0px';
        sector.style.background = fill ? fill : 'none';
        sector.style.width = String(dd)+'px';
        sector.style.height = String(dd)+'px';
        sector.style.border = 0 < lineSize ? String(lineSize)+'px '+lineStyle+' '+lineColor : 'none';
        sector.style.borderRadius = '50%';
        sector.style.left = String(x0)+'px';
        sector.style.top = String(y0)+'px';
        if ( da+EPS <= 2*stdMath.PI )
        {
            p0 = {x:x1, y:cy};
            p1 = {x:cx+radius*stdMath.cos(da), y:cy+radius*stdMath.sin(da)};
            clipPoints = p1.x < cx ? [
                p0,
                {x:cx, y:cy},
                p1,
                {x:x0, y:p1.y},
                {x:x0, y:y1},
                {x:p0.x, y:y1}
            ] : [
                p0,
                {x:cx, y:cy},
                p1,
                {x:x1, y:y1}

            ];
            clipPath = 'polygon('+clipPoints.map(function(pt){return String(pt.x-x0)+'px '+String(pt.y-y0)+'px'}).join(',')+')';

            sector.style.WebkitClipPath = 'border-box '+clipPath;
            sector.style.clipPath = 'border-box '+clipPath;

            sector.style.transformOrigin = 'center center';
            sector.style.transform = 'rotate('+String(ra0)+'rad)';
        }
        sector.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[sector.hitId] = {type:'sector', center:center, radius:radius, a0:a0, a1:a1, extra:extra||null};
        self.drawLayer.appendChild(sector);
        return self;
    }
    ,drawArc: function( start, radius, xAxisRotation,
                    largeArcFlag, sweepFlag, end,
                    lineSize, lineColor, lineStyle, extra
    ) {
        var self = this, hitId, i, n, params, samples, mat, a0, a1, acw,
            h = self.height();
        params = svgArc2canvasArc(start, radius, xAxisRotation||0, largeArcFlag?1:0, sweepFlag?1:0, end);
        //params = [centpX, centpY, xAxisRotation, sx, sy, rad, ang1, angd, sweepFlag];
        a0 = params[6]; a1 = params[6]+params[7]; acw = 1-params[8];
        mat = Matrix().scale(params[3], (acw?1:-1)*params[4]).rotate(-params[2]).translate(params[0], h-params[1]);
        samples = subdividePath(arc({x:0,y:0}, {x:params[5],y:params[5]}), acw ? -a0 : a0, acw ? -a1 : a1, 0.1, 20).map(function(pt){pt = mat.transform(pt); pt.y = h-pt.y; return pt;});
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[hitId] = {type:'arc', params:[start, radius, xAxisRotation,
                    largeArcFlag, sweepFlag, end], extra:extra||null};
        for(i=0,n=samples.length; i+1<n; i++)
            self.drawLine(samples[i], samples[i+1], lineSize, lineColor, lineStyle, null, hitId);
        return self;
    }
    ,drawBezier: function( points, lineSize, lineColor, lineStyle, extra ) {
        var self = this, hitId, i, n, mat, h = self.height(),
            samples = subdividePath({
                x: bezier(points.map(X)),
                y: bezier(points.map(Y).map(YH(h)))
            }, 0, 1, 0.5, 20).map(YH(h));
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[hitId] = {type:'bezier', points:points, extra:extra||null};
        for(i=0,n=samples.length; i+1<n; i++)
            self.drawLine(samples[i], samples[i+1], lineSize, lineColor, lineStyle, null, hitId);
        return self;
    }
    ,fitText: function( text, metricObj, maxWidth, lineHeight ) {
        var self = this, words = text.split(SPC),
            line = [], lines = [], w = 0,
            n, l, testLine, testWidth;

        metricObj.style.visibility = 'hidden';
        self.drawLayer.appendChild(metricObj);
        for(n=0,l=words.length; n<l; n++)
        {
            testLine = line.concat(words[n]);
            metricObj.textContent = testLine.join(' ');
            testWidth = metricObj.clientWidth;
            if ( (testWidth > maxWidth) && (0 < line.length) )
            {
                lines.push(line.join(' '));
                line = [words[n]];
            }
            else
            {
                line = testLine;
                w = stdMath.max(w, testWidth);
            }
        }
        if ( line.length )
        {
            lines.push(line.join(' '));
            w = stdMath.max(w, testWidth);
        }
        self.drawLayer.removeChild(metricObj);
        return {lines:lines, width:w, height:(lines.length-1)*lineHeight};
    }
    ,createText: function( str, textSize, textColor, maxWidth, lineHeight ) {
        var self = this, text = document.createElement('div'), metric, fitted;
        text.className = '--plot-text';
        text.style.position = 'absolute';
        text.style.display = 'inline-block';
        text.style.overflow = 'hidden';
        text.style.boxSizing = 'border-box';
        text.style.margin = '0px';
        text.style.padding = '0px';
        text.style.border = 'none';
        text.style.background = 'none';
        text.style.color = textColor;
        text.style.fontSize = String(textSize)+'px';
        text.style.fontFamily = 'sans-serif';
        text.style.textAlign = 'left';
        text.style.lineHeight = String(lineHeight)+'px';
        metric = document.createElement('span');
        metric.style.display = 'inline-block';
        metric.style.fontSize = String(textSize)+'px';
        metric.style.fontFamily = 'sans-serif';
        metric.style.padding = '0px';
        metric.style.margin = '0px';
        metric.style.border = 'none';
        fitted = self.fitText(str, metric, null==maxWidth ? Infinity : maxWidth, lineHeight);
        fitted.el = text;
        return fitted;
    }
    ,drawText: function( p, str, textSize, textColor, maxWidth ) {
        var self = this, text, lineHeight;
        textSize = null != textSize ? textSize : self.opts.text.size;
        textColor = String(textColor || self.opts.text.color).toLowerCase();
        lineHeight = 1.2*textSize;
        text = self.createText(String(str), textSize, textColor, maxWidth, lineHeight);
        text.el.style.left = String(p.x)+'px';
        text.el.style.top = String(p.y-textSize)+'px';
        text.lines.forEach(function(line){
            var tspan = document.createElement('span');
            tspan.style.position = 'relative';
            tspan.style.display = 'block';
            tspan.style.padding = '0px';
            tspan.style.margin = '0px';
            tspan.style.border = 'none';
            tspan.textContent = line;
            text.el.appendChild(tspan);
        });
        self.drawLayer.appendChild(text.el);
        return self;
    }
    ,drawLabel: function( pos, size, txt, opts ) {
        var self = this, maxWidth, lineHeight, x, y, w, h, text;
        opts = extend(true, clone(self.opts), opts||{});
        maxWidth = 'auto'===size.x ? Infinity : (size.x-opts.label.padding.left-opts.label.padding.right);
        lineHeight = 1.2*opts.label.text.size;
        text = self.createText(String(txt), opts.label.text.size, opts.label.text.color, maxWidth, lineHeight);
        w = 'auto'===size.x ? (text.width+opts.label.padding.left+opts.label.padding.right) : size.x;
        h = 'auto'===size.y ? (text.height+opts.label.padding.top+opts.label.padding.bottom) : size.y;
        x = pos.x; y = pos.y;
        if ( 'left' === x ) x = 0;
        else if ( 'right' === x ) x = self.width()-w;
        else if ( 'center' === x ) x = (self.width()-w)/2;
        if ( 'top' === y ) y = 0;
        else if ( 'bottom' === y ) y = self.height()-h;
        else if ( 'center' === y ) y = (self.height()-h)/2;
        self.drawRect({x:x+w/2,y:y+h/2}, {x:w,y:h}, 0, opts.label.border.size, opts.label.border.color, opts.label.border.style, opts.label.fill);
        x += opts.label.padding.left;
        y += opts.label.padding.top;
        text.el.style.left = String(x)+'px';
        text.el.style.top = String(y-opts.label.text.size)+'px';
        text.lines.forEach(function(line){
            var tspan = document.createElement('span');
            tspan.style.position = 'relative';
            tspan.style.display = 'block';
            tspan.style.padding = '0px';
            tspan.style.margin = '0px';
            tspan.style.border = 'none';
            tspan.textContent = line;
            text.el.appendChild(tspan);
        });
        self.drawLayer.appendChild(text.el);
        return self;
    }
});

Renderer.Canvas = function CanvasRenderer( container, opts ) {
    var self = this;
    if ( !(self instanceof CanvasRenderer) ) return new CanvasRenderer(container, opts);
    self.container = container;
    self.opts = extend(true, self.defaultOpts(), opts||{});
};
Renderer.Canvas[PROTO] = extend(new Renderer(), {
    constructor: Renderer.Canvas

    ,hitCanvas: null

    ,dispose: function( ) {
        var self = this;
        if ( self.container && self.hitCanvas )
            self.container.removeChild(self.hitCanvas);
        self.hitCanvas = null;
        return Renderer[PROTO].dispose.call(self);
    }
    ,init: function( ) {
        var self = this;
        if ( !self.drawLayer )
        {
            self.nextColor = [0,0,0];
            self.hitDict = {};
            self.hitTarget = null;
            self.hitCanvas = document.createElement('canvas');
            self.hitCanvas.style.position = 'absolute';
            self.hitCanvas.style.left = '0px';
            self.hitCanvas.style.top = '0px';
            self.hitCanvas.style.width = '100%';
            self.hitCanvas.style.height = '100%';
            self.hitCanvas.style.display = 'block';
            self.hitCanvas.style.margin = '0px';
            self.hitCanvas.style.padding = '0px';
            self.hitCanvas.style.border = 'none';
            self.hitCanvas.style.visibility = 'hidden';
            self.container.appendChild(self.hitCanvas);

            self.drawLayer = document.createElement('canvas');
            self.drawLayer.className = '--plot-canvas';
            self.drawLayer.style.position = 'absolute';
            self.drawLayer.style.left = '0px';
            self.drawLayer.style.top = '0px';
            self.drawLayer.style.width = '100%';
            self.drawLayer.style.height = '100%';
            self.drawLayer.style.display = 'block';
            self.drawLayer.style.margin = '0px';
            self.drawLayer.style.padding = '0px';
            self.drawLayer.style.border = 'none';
            self.container.appendChild(self.drawLayer);
            self.hitCanvas.width = self.width();
            self.hitCanvas.height = self.height();
            self.drawLayer.width = self.width();
            self.drawLayer.height = self.height();
            self.handler = Renderer.handler.bind(self);
            self.drawLayer.addEventListener('touchstart', self.handler, false);
            self.drawLayer.addEventListener('mouseenter', self.handler, false);
            self.drawLayer.addEventListener('click', self.handler, false);
        }
        return self;
    }
    ,objAt: function( evt, pos ) {
        var self = this, c;
        if ( self.hitCanvas )
        {
            c = '#'+rgb2hex(self.hitCanvas.getContext('2d').getImageData(stdMath.round(pos.left), stdMath.round(pos.top), 1, 1).data);
            if ( HAS.call(self.hitDict, c) )
                return self.hitDict[c];
        }
        return null;
    }
    ,resize: function( ) {
        var self = this;
        if ( self.drawLayer )
        {
            self.hitCanvas.width = self.width();
            self.hitCanvas.height = self.height();
            self.drawLayer.width = self.width();
            self.drawLayer.height = self.height();
        }
        return self;
    }
    ,clear: function( ) {
        var self = this, ctx = self.drawLayer.getContext("2d");
        ctx.fillStyle = String(self.opts.background.color);
        ctx.fillRect(0, 0, self.drawLayer.width, self.drawLayer.height);
        ctx = self.hitCanvas.getContext("2d");
        ctx.clearRect(0, 0, self.hitCanvas.width, self.hitCanvas.height);
        self.nextColor = [0,0,0];
        self.hitDict = {};
        self.hitTarget = null;
        return self;
    }
    ,background: function( background ) {
        var self = this;
        self.opts.background.color = background;
        return self;
    }
    ,drawPoint: function( p, pointSize, pointColor, extra ) {
        var self = this, c, ctx = self.drawLayer.getContext('2d');
        pointSize = null != pointSize ? pointSize : self.opts.point.size;
        pointColor = String(pointColor || self.opts.point.color).toLowerCase();
        ctx.resetTransform();
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointSize, 0, 2*stdMath.PI);
        ctx.closePath();
        ctx.fill();

        c = '#'+rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[c] = {type:'point', pos:p, extra:extra||null};
        ctx = self.hitCanvas.getContext("2d");
        ctx.resetTransform();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointSize, 0, 2*stdMath.PI);
        ctx.closePath();
        ctx.fill();
        return self;
    }
    ,drawLine: function( p1, p2, lineSize, lineColor, lineStyle, extra ) {
        var self = this, c, ctx = self.drawLayer.getContext('2d');
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        ctx.resetTransform();
        ctx.beginPath();
        if ( 'dashed' === lineStyle )
            ctx.setLineDash([4, 4]); // dashed
        else if ( 'dotted' === lineStyle )
            ctx.setLineDash([2, 4]); // dotted
        else
            ctx.setLineDash([]); // solid
        ctx.lineWidth = lineSize;
        ctx.strokeStyle = lineColor;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath();

        c = '#'+rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[c] = {type:'line', pos:[p1,p2], extra:extra||null};
        ctx = self.hitCanvas.getContext("2d");
        ctx.resetTransform();
        ctx.beginPath();
        ctx.lineWidth = lineSize;
        ctx.strokeStyle = c;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath();
        return self;
    }
    ,drawRect: function( center, side, rotation, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, c, ctx = self.drawLayer.getContext('2d');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        ctx.resetTransform();
        ctx.translate(center.x, center.y);
        ctx.rotate((rotation||0)*stdMath.PI/180);
        ctx.beginPath();
        if ( 0 < lineSize )
        {
            if ( 'dashed' === lineStyle )
                ctx.setLineDash([4, 4]); // dashed
            else if ( 'dotted' === lineStyle )
                ctx.setLineDash([2, 4]); // dotted
            else
                ctx.setLineDash([]); // solid
            ctx.lineWidth = lineSize;
            ctx.strokeStyle = lineColor;
        }
        ctx.rect(-side.x/2, -side.y/2, side.x, side.y);
        if ( fill && 'none' !== fill )
        {
            ctx.fillStyle = fill;
            ctx.fill()
        }
        if ( 0 < lineSize )
        {
            ctx.stroke();
        }
        ctx.closePath();
        ctx.resetTransform();

        c = '#'+rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[c] = {type:'rect', center:center, side:side, rotation:rotation, extra:extra||null};
        ctx = self.hitCanvas.getContext("2d");
        ctx.resetTransform();
        ctx.translate(center.x, center.y);
        ctx.rotate((rotation||0)*stdMath.PI/180);
        ctx.beginPath();
        if ( 0 < lineSize )
        {
            ctx.lineWidth = lineSize;
            ctx.strokeStyle = c;
        }
        ctx.rect(-side.x/2, -side.y/2, side.x, side.y);
        ctx.fillStyle = c;
        ctx.fill()
        if ( 0 < lineSize )
        {
            ctx.stroke();
        }
        ctx.closePath();
        ctx.resetTransform();
        return self;
    }
    ,drawEllipse: function( center, radius, rotation, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, c, ctx = self.drawLayer.getContext('2d');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        ctx.resetTransform();
        ctx.beginPath();
        if ( 0 < lineSize )
        {
            if ( 'dashed' === lineStyle )
                ctx.setLineDash([4, 4]); // dashed
            else if ( 'dotted' === lineStyle )
                ctx.setLineDash([2, 4]); // dotted
            else
                ctx.setLineDash([]); // solid
            ctx.lineWidth = lineSize;
            ctx.strokeStyle = lineColor;
        }
        ctx.ellipse(center.x, center.y, radius.x, radius.y, (rotation||0)*stdMath.PI/180, 0, 2*stdMath.PI, 0);
        if ( fill && 'none' !== fill )
        {
            ctx.fillStyle = fill;
            ctx.fill()
        }
        if ( 0 < lineSize )
            ctx.stroke();
        ctx.closePath();
        ctx.resetTransform();

        c = '#'+rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[c] = {type:'ellipse', center:center, radius:radius, rotation:rotation, extra:extra||null};
        ctx = self.hitCanvas.getContext("2d");
        ctx.resetTransform();
        ctx.beginPath();
        if ( 0 < lineSize )
        {
            ctx.lineWidth = lineSize;
            ctx.strokeStyle = c;
        }
        ctx.ellipse(center.x, center.y, radius.x, radius.y, (rotation||0)*stdMath.PI/180, 0, 2*stdMath.PI, 0);
        ctx.fillStyle = c;
        ctx.fill()
        if ( 0 < lineSize )
            ctx.stroke();
        ctx.closePath();
        ctx.resetTransform();
        return self;
    }
    ,drawSector: function( center, radius, a0, a1, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, c, ra0, ra1, ctx = self.drawLayer.getContext('2d');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        ra0 = a0*stdMath.PI/180;
        ra1 = a1*stdMath.PI/180;
        ctx.resetTransform();
        ctx.beginPath();
        if ( 0 < lineSize )
        {
            if ( 'dashed' === lineStyle )
                ctx.setLineDash([4, 4]); // dashed
            else if ( 'dotted' === lineStyle )
                ctx.setLineDash([2, 4]); // dotted
            else
                ctx.setLineDash([]); // solid
            ctx.lineWidth = lineSize;
            ctx.strokeStyle = lineColor;
        }
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, ra0, ra1, false);
        ctx.closePath();
        if ( fill && 'none' !== fill )
        {
            ctx.fillStyle = fill;
            ctx.fill()
        }
        if ( 0 < lineSize )
            ctx.stroke();
        ctx.resetTransform();

        c = '#'+rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[c] = {type:'sector', center:center, radius:radius, a0:a0, a1:a1, extra:extra||null};
        ctx = self.hitCanvas.getContext("2d");
        ctx.resetTransform();
        ctx.beginPath();
        if ( 0 < lineSize )
        {
            ctx.lineWidth = lineSize;
            ctx.strokeStyle = c;
        }
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, ra0, ra1, false);
        ctx.closePath();
        ctx.fillStyle = c;
        ctx.fill()
        if ( 0 < lineSize )
            ctx.stroke();
        ctx.resetTransform();
        return self;
    }
    ,drawArc: function( start, radius, xAxisRotation,
                    largeArcFlag, sweepFlag, end,
                    lineSize, lineColor, lineStyle, extra
    ) {
        var self = this, c, ctx = self.drawLayer.getContext('2d'), params;
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        params = svgArc2canvasArc(start, radius, xAxisRotation||0, largeArcFlag?1:0, sweepFlag?1:0, end);
        //params = [centpX, centpY, xAxisRotation, sx, sy, rad, ang1, angd, sweepFlag];
        ctx.resetTransform();
        ctx.beginPath();
        if ( 'dashed' === lineStyle )
            ctx.setLineDash([4, 4]); // dashed
        else if ( 'dotted' === lineStyle )
            ctx.setLineDash([2, 4]); // dotted
        else
            ctx.setLineDash([]); // solid
        ctx.lineWidth = lineSize;
        ctx.strokeStyle = lineColor;
        ctx.translate(params[0], params[1]);
        ctx.rotate(params[2]);
        ctx.scale(params[3], params[4]);
        ctx.arc(0, 0, params[5], params[6], params[6]+params[7], 1-params[8]);
        //ctx.scale(1/params[3], 1/params[4]);
        //ctx.rotate(-params[2]);
        //ctx.translate(-params[0], -params[1]);
        ctx.stroke();
        ctx.closePath();
        ctx.resetTransform();

        c = '#'+rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[c] = {type:'arc', params:[start, radius, xAxisRotation,
                    largeArcFlag, sweepFlag, end], extra:extra||null};
        ctx = self.hitCanvas.getContext("2d");
        ctx.resetTransform();
        ctx.beginPath();
        ctx.lineWidth = lineSize;
        ctx.strokeStyle = c;
        ctx.translate(params[0], params[1]);
        ctx.rotate(params[2]);
        ctx.scale(params[3], params[4]);
        ctx.arc(0, 0, params[5], params[6], params[6]+params[7], 1-params[8]);
        ctx.stroke();
        ctx.closePath();
        ctx.resetTransform();
        return self;
    }
    ,drawBezier: function( points, lineSize, lineColor, lineStyle, extra ) {
        var self = this, c, ctx = self.drawLayer.getContext('2d');
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        ctx.resetTransform();
        ctx.beginPath();
        if ( 'dashed' === lineStyle )
            ctx.setLineDash([4, 4]); // dashed
        else if ( 'dotted' === lineStyle )
            ctx.setLineDash([2, 4]); // dotted
        else
            ctx.setLineDash([]); // solid
        ctx.lineWidth = lineSize;
        ctx.strokeStyle = lineColor;
        ctx.moveTo(points[0].x, points[0].y);
        ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
        ctx.stroke();
        ctx.closePath();

        c = '#'+rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[c] = {type:'bezier', points:points, extra:extra||null};
        ctx = self.hitCanvas.getContext("2d");
        ctx.resetTransform();
        ctx.beginPath();
        ctx.lineWidth = lineSize;
        ctx.strokeStyle = c;
        ctx.moveTo(points[0].x, points[0].y);
        ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
        ctx.stroke();
        ctx.closePath();
        return self;
    }
    ,fitText: function( text, metricCtx, maxWidth, lineHeight ) {
        var self = this, words = text.split(SPC),
            line = [], lines = [], w = 0,
            n, l, testLine, metrics, testWidth;

        for(n=0,l=words.length; n<l; n++)
        {
            testLine = line.concat(words[n]);
            metrics = metricCtx.measureText(testLine.join(' '));
            testWidth = metrics.width;
            if ( (testWidth > maxWidth) && (0 < line.length) )
            {
                lines.push(line.join(' '));
                line = [words[n]];
            }
            else
            {
                line = testLine;
                w = stdMath.max(w, testWidth);
            }
        }
        if ( line.length )
        {
            lines.push(line.join(' '));
            w = stdMath.max(w, testWidth);
        }
        return {lines:lines, width:w, height:(lines.length-1)*lineHeight};
    }
    ,createText: function( str, textSize, textColor, maxWidth, lineHeight ) {
        var self = this, ctx = self.drawLayer.getContext('2d'), fitted;
        ctx.resetTransform();
        ctx.font = String(textSize)+'px sans-serif';
        ctx.fillStyle = textColor;
        fitted = self.fitText(str, ctx, null==maxWidth ? Infinity : maxWidth, lineHeight);
        fitted.el = ctx;
        return fitted;
    }
    ,drawText: function( p, str, textSize, textColor, maxWidth ) {
        var self = this, text, lineHeight, dy = 0;
        textSize = null != textSize ? textSize : self.opts.text.size;
        textColor = String(textColor || self.opts.text.color).toLowerCase();
        lineHeight = 1.2*textSize;
        text = self.createText(String(str), textSize, textColor, maxWidth, lineHeight);
        text.lines.forEach(function(line){
            text.el.fillText(line, p.x, p.y+dy);
            dy += lineHeight;
        });
        return self;
    }
    ,drawLabel: function( pos, size, txt, opts ) {
        var self = this, maxWidth, lineHeight, x, y, dy = 0, w, h, text;
        opts = extend(true, clone(self.opts), opts||{});
        maxWidth = 'auto'===size.x ? Infinity : (size.x-opts.label.padding.left-opts.label.padding.right);
        lineHeight = 1.2*opts.label.text.size;
        text = self.createText(String(txt), opts.label.text.size, opts.label.text.color, maxWidth, lineHeight);
        text.el.save();
        w = 'auto'===size.x ? (text.width+opts.label.padding.left+opts.label.padding.right) : size.x;
        h = 'auto'===size.y ? (text.height+opts.label.padding.top+opts.label.padding.bottom) : size.y;
        x = pos.x; y = pos.y;
        if ( 'left' === x ) x = 0;
        else if ( 'right' === x ) x = self.width()-w;
        else if ( 'center' === x ) x = (self.width()-w)/2;
        if ( 'top' === y ) y = 0;
        else if ( 'bottom' === y ) y = self.height()-h;
        else if ( 'center' === y ) y = (self.height()-h)/2;
        self.drawRect({x:x+w/2,y:y+h/2}, {x:w,y:h}, 0, opts.label.border.size, opts.label.border.color, opts.label.border.style, opts.label.fill);
        x += opts.label.padding.left;
        y += opts.label.padding.top;
        text.el.restore();
        text.lines.forEach(function(line){
            text.el.fillText(line, x, y+dy);
            dy += lineHeight;
        });
        return self;
    }
});

Renderer.Svg = function SvgRenderer( container, opts ) {
    var self = this;
    if ( !(self instanceof SvgRenderer) ) return new SvgRenderer(container, opts);
    self.container = container;
    self.opts = extend(true, self.defaultOpts(), opts||{});
};
Renderer.Svg[PROTO] = extend(new Renderer(), {
    constructor: Renderer.Svg
    ,NS: 'http://www.w3.org/2000/svg'
    ,init: function( ) {
        var self = this;
        if ( !self.drawLayer )
        {
            self.nextColor = [0,0,0];
            self.hitDict = {};
            self.hitTarget = null;
            self.drawLayer = document.createElementNS(self.NS, 'svg');
            self.drawLayer.setAttribute('class', '--plot-svg');
            self.drawLayer.style.position = 'absolute';
            self.drawLayer.style.left = '0px';
            self.drawLayer.style.top = '0px';
            self.drawLayer.style.width = '100%';
            self.drawLayer.style.height = '100%';
            self.drawLayer.style.display = 'block';
            self.drawLayer.style.overflow = 'hidden';
            self.drawLayer.style.margin = '0px';
            self.drawLayer.style.padding = '0px';
            self.drawLayer.style.border = 'none';
            self.drawLayer.style.backgroundColor = self.opts.background.color;
            self.container.appendChild(self.drawLayer);
            self.drawLayer.setAttribute('viewBox', '0 0 '+String(self.width())+' '+String(self.height()));
            self.handler = Renderer.handler.bind(self);
            self.drawLayer.addEventListener('touchstart', self.handler, false);
            self.drawLayer.addEventListener('mouseenter', self.handler, false);
            self.drawLayer.addEventListener('click', self.handler, false);
        }
        return self;
    }
    ,objAt: function( evt, pos ) {
        var self = this, hitId = evt.target ? evt.target.hitId : null;
        return hitId && HAS.call(self.hitDict, hitId) ? self.hitDict[hitId] : null;
    }
    ,resize: function( ) {
        var self = this;
        if ( self.drawLayer )
        {
            self.drawLayer.setAttribute('viewBox', '0 0 '+String(self.width())+' '+String(self.height()));
        }
        return self;
    }
    ,clear: function( ) {
        var self = this;
        self.drawLayer.innerHTML = ''; // empty
        self.nextColor = [0,0,0];
        self.hitDict = {};
        self.hitTarget = null;
        return self;
    }
    ,background: function( background ) {
        var self = this;
        self.opts.background.color = background;
        self.drawLayer.style.backgroundColor = self.opts.background.color;
        return self;
    }
    ,drawPoint: function( p, pointSize, pointColor, extra ) {
        var self = this, point = document.createElementNS(self.NS,'circle');
        pointSize = null!=pointSize ? pointSize : self.opts.point.size;
        pointColor = String(pointColor || self.opts.point.color).toLowerCase();
        point.setAttribute('class', '--plot-point');
        point.setAttribute('cx', String(p.x));
        point.setAttribute('cy', String(p.y));
        point.setAttribute('r', String(pointSize));
        point.setAttribute('stroke-width', '1px');
        point.setAttribute('stroke', pointColor);
        point.setAttribute('fill', pointColor);
        point.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[point.hitId] = {type:'point', pos:p, extra:extra||null};
        self.drawLayer.appendChild(point);
        return self;
    }
    ,drawLine: function( p1, p2, lineSize, lineColor, lineStyle, extra ) {
        var self = this, line = document.createElementNS(self.NS,'line');
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        line.setAttribute('class', '--plot-line');
        line.setAttribute('x1', String(p1.x));
        line.setAttribute('y1', String(p1.y));
        line.setAttribute('x2', String(p2.x));
        line.setAttribute('y2', String(p2.y));
        line.setAttribute('stroke-width', String(lineSize)+'px');
        line.setAttribute('stroke', lineColor);
        if ( 'dashed' === lineStyle )
            line.setAttribute('stroke-dasharray', '4 4');
        else if ( 'dotted' === lineStyle )
            line.setAttribute('stroke-dasharray', '2 4');
        line.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[line.hitId] = {type:'line', pos:[p1,p2], extra:extra||null};
        self.drawLayer.appendChild(line);
        return self;
    }
    ,drawRect: function( center, side, rotation, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, rect = document.createElementNS(self.NS, 'rect');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        rect.setAttribute('class', '--plot-rectangle');
        rect.setAttribute('x', String(center.x-side.x/2));
        rect.setAttribute('y', String(center.y-side.y/2));
        rect.setAttribute('width', String(side.x));
        rect.setAttribute('height', String(side.y));
        rect.setAttribute('transform', 'rotate('+String(rotation||0)+' '+String(center.x)+' '+String(center.y)+')');
        if ( 0 < lineSize )
        {
            rect.setAttribute('stroke-width', String(lineSize)+'px');
            rect.setAttribute('stroke', lineColor);
            if ( 'dashed' === lineStyle )
                rect.setAttribute('stroke-dasharray', '4 4');
            else if ( 'dotted' === lineStyle )
                rect.setAttribute('stroke-dasharray', '2 4');
        }
        rect.setAttribute('fill', fill ? fill : 'none');
        rect.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[rect.hitId] = {type:'rect', center:center, side:side, rotation:rotation, extra:extra||null};
        self.drawLayer.appendChild(rect);
        return self;
    }
    ,drawEllipse: function( center, radius, rotation, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, ellipse = document.createElementNS(self.NS, 'ellipse');
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        ellipse.setAttribute('class', '--plot-ellipse');
        ellipse.setAttribute('cx', String(center.x));
        ellipse.setAttribute('cy', String(center.y));
        ellipse.setAttribute('rx', String(radius.x));
        ellipse.setAttribute('ry', String(radius.y));
        ellipse.setAttribute('transform', 'rotate('+String(rotation||0)+' '+String(center.x)+' '+String(center.y)+')');
        if ( 0 < lineSize )
        {
            ellipse.setAttribute('stroke-width', String(lineSize)+'px');
            ellipse.setAttribute('stroke', lineColor);
            if ( 'dashed' === lineStyle )
                ellipse.setAttribute('stroke-dasharray', '4 4');
            else if ( 'dotted' === lineStyle )
                ellipse.setAttribute('stroke-dasharray', '2 4');
        }
        ellipse.setAttribute('fill', fill ? fill : 'none');
        ellipse.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[ellipse.hitId] = {type:'ellipse', center:center, radius:radius, rotation:rotation, extra:extra||null};
        self.drawLayer.appendChild(ellipse);
        return self;
    }
    ,drawSector: function( center, radius, a0, a1, lineSize, lineColor, lineStyle, fill, extra ) {
        var self = this, c, ra0, ra1, da, cx, cy, p0, p1, sector, hitId;
        lineSize = null!=lineSize ? lineSize : self.opts.shape.border.size;
        lineColor = String(lineColor || self.opts.shape.border.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.shape.border.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        fill = String(null != fill ? fill : self.opts.shape.fill).toLowerCase();
        ra0 = a0*stdMath.PI/180; ra1 = a1*stdMath.PI/180;
        da = ra1-ra0; cx = center.x; cy = center.y;
        hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        if ( da+EPS > 2*stdMath.PI )
        {
            sector = document.createElementNS(self.NS,'ellipse');
            sector.setAttribute('cx', String(cx));
            sector.setAttribute('cy', String(cy));
            sector.setAttribute('rx', String(radius));
            sector.setAttribute('ry', String(radius));
        }
        else
        {
            p0 = {x:cx+radius, y:cy};
            p1 = {x:cx+radius*stdMath.cos(da), y:cy+radius*stdMath.sin(da)};
            sector = document.createElementNS(self.NS,'path');
            sector.setAttribute('d', 'M '+String(cx)+' '+String(cy)+' L '+String(p0.x)+' '+String(p0.y)+' A '+String(radius)+' '+String(radius)+' 0 '+String(da>=stdMath.PI?1:0)+' 1 '+String(p1.x)+' '+String(p1.y)+' L '+String(cx)+' '+String(cy)+' Z');
            sector.setAttribute('transform', 'rotate('+String(a0)+' '+String(cx)+' '+String(cy)+')');
        }
        sector.setAttribute('class', '--plot-sector');
        sector.setAttribute('stroke-width', String(lineSize)+'px');
        sector.setAttribute('stroke', lineColor);
        sector.setAttribute('fill', fill);
        if ( 'dashed' === lineStyle )
            sector.setAttribute('stroke-dasharray', '4 4');
        else if ( 'dotted' === lineStyle )
            sector.setAttribute('stroke-dasharray', '2 4');
        sector.hitId = hitId;
        self.hitDict[sector.hitId] = {type:'sector', center:center, radius:radius, a0:a0, a1:a1, extra:extra||null};
        self.drawLayer.appendChild(sector);
        return self;
    }
    ,drawArc: function( start, radius, xAxisRotation,
                    largeArcFlag, sweepFlag, end,
                    lineSize, lineColor, lineStyle, extra
    ) {
        var self = this, path = document.createElementNS(self.NS,'path');
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        path.setAttribute('class', '--plot-arc');
        path.setAttribute('d', 'M '+String(start.x)+' '+String(start.y)+' A '+String(radius.x)+' '+String(radius.y)+' '+String(xAxisRotation||0)+' '+String(largeArcFlag?1:0)+' '+String(sweepFlag?1:0)+' '+String(end.x)+' '+String(end.y)/*+' Z'*/);
        path.setAttribute('stroke-width', String(lineSize)+'px');
        path.setAttribute('stroke', lineColor);
        path.setAttribute('fill', 'none');
        if ( 'dashed' === lineStyle )
            path.setAttribute('stroke-dasharray', '4 4');
        else if ( 'dotted' === lineStyle )
            path.setAttribute('stroke-dasharray', '2 4');
        path.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[path.hitId] = {type:'arc', params:[start, radius, xAxisRotation,
                    largeArcFlag, sweepFlag, end], extra:extra||null};
        self.drawLayer.appendChild(path);
        return self;
    }
    ,drawBezier: function( points, lineSize, lineColor, lineStyle, extra ) {
        var self = this, path = document.createElementNS(self.NS,'path');
        lineSize = null!=lineSize ? lineSize : self.opts.line.size;
        lineColor = String(lineColor || self.opts.line.color).toLowerCase();
        lineStyle = String(lineStyle || self.opts.line.style).toLowerCase();
        if ( 'dashed' !== lineStyle && 'dotted' !== lineStyle )
            lineStyle = 'solid';
        path.setAttribute('class', '--plot-bezier');
        path.setAttribute('d', 'M '+String(points[0].x)+','+String(points[0].y)+' C '+String(points[1].x)+','+String(points[1].y)+' '+String(points[2].x)+','+String(points[2].y)+' '+String(points[3].x)+','+String(points[3].y)/*+' Z'*/);
        path.setAttribute('stroke-width', String(lineSize)+'px');
        path.setAttribute('stroke', lineColor);
        if ( 'dashed' === lineStyle )
            path.setAttribute('stroke-dasharray', '4 4');
        else if ( 'dotted' === lineStyle )
            path.setAttribute('stroke-dasharray', '2 4');
        path.hitId = rgb2hex(self.nextColor = nextRGB(self.nextColor));
        self.hitDict[path.hitId] = {type:'bezier', points:points, extra:extra||null};
        self.drawLayer.appendChild(path);
        return self;
    }
    ,fitText: function( text, metricObj, maxWidth, lineHeight ) {
        var self = this, words = text.split(SPC),
            line = [], lines = [], w = 0,
            n, l, testLine, metrics, testWidth;

        metricObj.style.visibility = 'hidden';
        self.drawLayer.appendChild(metricObj);
        for(n=0,l=words.length; n<l; n++)
        {
            testLine = line.concat(words[n]);
            metricObj.textContent = testLine.join(' ');
            metrics = metricObj.getBBox();
            testWidth = stdMath.round(metrics.width);
            if ( (testWidth > maxWidth) && (0 < line.length) )
            {
                lines.push(line.join(' '));
                line = [words[n]];
            }
            else
            {
                line = testLine;
                w = stdMath.max(w, testWidth);
            }
        }
        if ( line.length )
        {
            lines.push(line.join(' '));
            w = stdMath.max(w, testWidth);
        }
        self.drawLayer.removeChild(metricObj);
        return {lines:lines, width:w, height:(lines.length-1)*lineHeight};
    }
    ,createText: function( str, textSize, textColor, maxWidth, lineHeight ) {
        var self = this, text = document.createElementNS(self.NS, 'text'), fitted;
        text.setAttribute('class', '--plot-text');
        text.setAttribute('fill', textColor);
        text.style.fontSize = String(textSize)+'px';
        text.style.fontFamily = 'sans-serif';
        fitted = self.fitText(str, text.cloneNode(false), null==maxWidth ? Infinity : maxWidth, lineHeight);
        fitted.el = text;
        return fitted;
    }
    ,drawText: function( p, str, textSize, textColor, maxWidth ) {
        var self = this, text, lineHeight, dy = 0;
        textSize = null != textSize ? textSize : self.opts.text.size;
        textColor = String(textColor || self.opts.text.color).toLowerCase();
        lineHeight = 1.2*textSize;
        text = self.createText(String(str), textSize, textColor, maxWidth, lineHeight);
        text.el.setAttribute('x', p.x);
        text.el.setAttribute('y', p.y);
        text.lines.forEach(function(line){
            var tspan = document.createElementNS(self.NS, 'tspan');
            tspan.setAttribute('x', p.x);
            tspan.setAttribute('dy', dy);
            tspan.textContent = line;
            text.el.appendChild(tspan);
            if ( 0 === dy ) dy = lineHeight;
        });
        self.drawLayer.appendChild(text.el);
        return self;
    }
    ,drawLabel: function( pos, size, txt, opts ) {
        var self = this, maxWidth, lineHeight, x, y, dy = 0, w, h, text;
        opts = extend(true, clone(self.opts), opts||{});
        maxWidth = 'auto'===size.x ? Infinity : (size.x-opts.label.padding.left-opts.label.padding.right);
        lineHeight = 1.2*opts.label.text.size;
        text = self.createText(String(txt), opts.label.text.size, opts.label.text.color, maxWidth, lineHeight);
        w = 'auto'===size.x ? (text.width+opts.label.padding.left+opts.label.padding.right) : size.x;
        h = 'auto'===size.y ? (text.height+opts.label.padding.top+opts.label.padding.bottom) : size.y;
        x = pos.x; y = pos.y;
        if ( 'left' === x ) x = 0;
        else if ( 'right' === x ) x = self.width()-w;
        else if ( 'center' === x ) x = (self.width()-w)/2;
        if ( 'top' === y ) y = 0;
        else if ( 'bottom' === y ) y = self.height()-h;
        else if ( 'center' === y ) y = (self.height()-h)/2;
        self.drawRect({x:x+w/2,y:y+h/2}, {x:w,y:h}, 0, opts.label.border.size, opts.label.border.color, opts.label.border.style, opts.label.fill);
        x += opts.label.padding.left;
        y += opts.label.padding.top;
        text.el.setAttribute('x', x);
        text.el.setAttribute('y', y);
        text.lines.forEach(function(line){
            var tspan = document.createElementNS(self.NS, 'tspan');
            tspan.setAttribute('x', x);
            tspan.setAttribute('dy', dy);
            tspan.textContent = line;
            text.el.appendChild(tspan);
            if ( 0 === dy ) dy = lineHeight;
        });
        self.drawLayer.appendChild(text.el);
        return self;
    }
});

function Plot( renderer, opts )
{
    var self = this;
    if ( !(self instanceof Plot) ) return new Plot(renderer, opts);
    self.renderer = renderer instanceof Plot.Renderer ? renderer : new Plot.Renderer.Html(renderer || document.body);
    self.tooltip = document.createElement('div');
    self.tooltip.className = '--plot-tooltip --plot-hide-tooltip';
    self.tooltip.style.position = 'absolute';
    document.body.appendChild(self.tooltip);
    self.opts = extend(true, self.defaultOpts(), opts||{});
}
Plot[PROTO] = {
    constructor: Plot

    ,renderer: null
    ,opts: null

    ,dispose: function( ) {
        var self = this;
        if ( self.tooltip )
            document.body.removeChild(self.tooltip);
        self.renderer = null;
        self.tooltip = null;
        self.opts = null;
        return self;
    }

    ,defaultOpts: function( ) {
        return {
            tolerance: 0.001,
            depth: 20,
            npoints: 60,

            background: {
                color: '#ffffff'
            },

            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },

            text: {
                size: 14,
                color: '#000000'
            },
            point: {
                size: 4,
                color: '#000000'
            },
            line: {
                size: 1,
                color: '#000000',
                style: 'solid'
            },
            shape: {
                border: {
                    size: 1,
                    color: '#000000',
                    style: 'solid'
                },
                fill: 'none'
            },
            label: {
                text: {
                    size: 14,
                    color: '#000000'
                },
                border: {
                    size: 1,
                    color: '#000000',
                    style: 'solid'
                },
                fill: 'none',
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            },

            colors: null,
            labels: null,

            axes: {
                x: {
                    size: 2,
                    color: '#000000',
                    style: 'solid',
                    ticks: {
                        size: 1,
                        color: 'rgba(0,0,0,0.5)',
                        style: 'dashed',
                        text: {
                            size: 16,
                            color: '#000000'
                        },
                        step: 'auto',
                        scale: 'linear'
                    }
                },
                y: {
                    size: 2,
                    color: '#000000',
                    style: 'solid',
                    ticks: {
                        size: 1,
                        color: 'rgba(0,0,0,0.5)',
                        style: 'dashed',
                        text: {
                            size: 16,
                            color: '#000000'
                        },
                        step: 'auto',
                        scale: 'linear'
                    }
                }
            }
        };
    }

    ,boundingBox: function( points ) {
        var i, n = points.length, minX, minY, maxX, maxY;
        if ( 'number' === typeof points[0] )
        {
            minX = Infinity; maxX = -Infinity;
            for(i=0; i<n; i++)
            {
                if ( !is_finite(points[i]) ) continue;
                if ( points[i] < minX ) minX = points[i];
                if ( points[i] > maxX ) maxX = points[i];
            }
            return {min:minX, max:maxX};
        }
        else
        {
            minX = Infinity; maxX = -Infinity;
            minY = Infinity; maxY = -Infinity;
            for(i=0; i<n; i++)
            {
                if ( !Point.isFinite(points[i]) ) continue;
                if ( points[i].x < minX ) minX = points[i].x;
                if ( points[i].y < minY ) minY = points[i].y;
                if ( points[i].x > maxX ) maxX = points[i].x;
                if ( points[i].y > maxY ) maxY = points[i].y;
            }
            return {min:{x:minX, y:minY}, max:{x:maxX, y:maxY}};
        }
    }

    ,sample: function( f, x0, x1, opts ) {
        var self = this, points, p, i, h, n;

        opts = extend(clone(self.opts), opts||{});

        if ( null == x0 ) x0 = 0;
        if ( null == x1 ) x1 = x0+1;
        f = is_callable(f.x) && is_callable(f.y) ? f : {x:lin, y:f};

        n = stdMath.ceil(2*opts.npoints/3); h = (x1-x0)/n; points = [];
        for(i=0; i<n; i++)
        {
            p = subdividePath(f, x0+i*h, x0+(i+1)*h, opts.tolerance, opts.depth);
            points = points.concat(0 < i ? p.slice(1) : p); // remove duplicate point
        }
        return points;
    }

    ,width: function( ) {
        return this.renderer.init().width();
    }

    ,height: function( ) {
        return this.renderer.init().height();
    }

    ,resize: function( ) {
        this.renderer.init().resize();
        return this;
    }

    ,clear: function( ) {
        var self = this;
        self.renderer.init().background(self.opts.background.color).clear();
        return self;
    }

    ,text: function( pos, text, opts ) {
        var self = this, i, n;
        opts = extend(true, clone(self.opts), opts||{});
        self.renderer.init(); // lazy init
        self.renderer.drawText(pos, text, opts.text.size, opts.text.color);
        return self;
    }

    ,point: function( points, opts ) {
        var self = this, i, n;
        opts = extend(true, clone(self.opts), opts||{});
        self.renderer.init(); // lazy init
        if ( !is_array(points) ) points = [points];
        for(i=0,n=points.length; i<n; i++)
        {
            if ( Point.isFinite(points[i]) )
                self.renderer.drawPoint(points[i], opts.point.size, opts.point.color);
        }
        return self;
    }

    ,line: function( points, opts ) {
        var self = this, i, n;
        opts = extend(true, clone(self.opts), opts||{});
        self.renderer.init(); // lazy init
        if ( !is_array(points) ) points = [points];
        for(i=0,n=points.length; i+1<n; i++)
        {
            if ( Point.isFinite(points[i]) && Point.isFinite(points[i+1]) )
                self.renderer.drawLine(points[i], points[i+1], opts.line.size, opts.line.color, opts.line.style);
        }
        return self;
    }

    ,rectangle: function( center, side, rotation, opts ) {
        var self = this;
        self.renderer.init(); // lazy init
        if ( 2 >= arguments.length && is_array(center) )
        {
            opts = extend(true, clone(self.opts), side||{});
            center.forEach(function(args){
                opts = extend(true, opts, args[3]||{});
                rotation = args[2]
                side = args[1];
                if ( "number" === typeof side ) side = {x:side, y:side};
                center = args[0];
                self.renderer.drawRect(center, side, rotation||0, opts.shape.border.size, opts.shape.border.color, opts.shape.border.style, opts.shape.fill);
            });
        }
        else
        {
            opts = extend(true, clone(self.opts), opts||{});
            self.renderer.drawRect(center, side, rotation||0, opts.shape.border.size, opts.shape.border.color, opts.shape.border.style, opts.shape.fill);
        }
        return self;
    }

    ,ellipse: function( center, radius, rotation, opts ) {
        var self = this;
        self.renderer.init(); // lazy init
        if ( 2 >= arguments.length && is_array(center) )
        {
            opts = extend(true, clone(self.opts), radius||{});
            center.forEach(function(args){
                opts = extend(true, opts, args[3]||{});
                rotation = args[2]
                radius = args[1];
                if ( "number" === typeof radius ) radius = {x:radius, y:radius};
                center = args[0];
                self.renderer.drawEllipse(center, radius, rotation||0, opts.shape.border.size, opts.shape.border.color, opts.shape.border.style, opts.shape.fill);
            });
        }
        else
        {
            opts = extend(true, clone(self.opts), opts||{});
            if ( "number" === typeof radius ) radius = {x:radius, y:radius};
            self.renderer.drawEllipse(center, radius, rotation||0, opts.shape.border.size, opts.shape.border.color, opts.shape.border.style, opts.shape.fill);
        }
        return self;
    }

    ,sector: function( center, radius, startAngle, endAngle, opts ) {
        var self = this;
        self.renderer.init(); // lazy init
        if ( 2 >= arguments.length && is_array(center) )
        {
            opts = extend(true, clone(self.opts), radius||{});
            center.forEach(function(args){
                opts = extend(true, opts, args[4]||{});
                endAngle = args[3];
                startAngle = args[2];
                radius = args[1];
                center = args[0];
                self.renderer.drawSector(center, +radius, +startAngle, +endAngle, opts.shape.border.size, opts.shape.border.color, opts.shape.border.style, opts.shape.fill);
            });
        }
        else
        {
            opts = extend(true, clone(self.opts), opts||{});
            self.renderer.drawSector(center, +radius, +startAngle, +endAngle, opts.shape.border.size, opts.shape.border.color, opts.shape.border.style, opts.shape.fill);
        }
        return self;
    }

    ,arc: function( start, radius, xAxisRotation,
                    largeArcFlag, sweepFlag, end, opts
    ) {
        var self = this;
        self.renderer.init(); // lazy init
        if ( 2 >= arguments.length && is_array(start) )
        {
            opts = extend(true, clone(self.opts), radius||{});
            start.forEach(function(args){
                opts = extend(true, opts, args[6]||{});
                end = args[5];
                sweepFlag = args[4];
                largeArcFlag = args[3];
                xAxisRotation = args[2];
                radius = args[1];
                if ( "number" === typeof radius ) radius = {x:radius, y:radius};
                start = args[0];
                self.renderer.drawArc(start, radius, +(xAxisRotation||0),
                            largeArcFlag?1:0, sweepFlag?1:0, end,
                            opts.line.size, opts.line.color, opts.line.style);
            });
        }
        else
        {
            opts = extend(true, clone(self.opts), opts||{});
            if ( "number" === typeof radius ) radius = {x:radius, y:radius};
            self.renderer.drawArc(start, radius, +(xAxisRotation||0),
                        largeArcFlag?1:0, sweepFlag?1:0, end,
                        opts.line.size, opts.line.color, opts.line.style);
        }
        return self;
    }

    ,bezier: function( points, opts ) {
        var self = this;
        opts = extend(true, clone(self.opts), opts||{});
        self.renderer.init(); // lazy init
        if ( !is_array(points) ) points = [points];
        if ( 2 === points.length )
            self.renderer.drawLine(points[0], points[1], opts.line.size, opts.line.color, opts.line.style);
        else if ( 4 <= points.length )
            self.renderer.drawBezier(points, opts.line.size, opts.line.color, opts.line.style);
        return self;
    }

    ,spline: function( knots, opts ) {
        if ( !is_array(knots) ) knots = [knots];
        var self = this, i, n,
            segments = {
                x: bezierThrough(knots.map(X)),
                y: bezierThrough(knots.map(Y))
            }, points;
        points = segments.x.reduce(function(points, s, i){
            return s.reduce(function(points, si, j){
                points.push(new Point(segments.x[i][j], segments.y[i][j]));
                return points;
            }, points);
        }, []);
        n = points.length;
        opts = extend(true, clone(self.opts), opts||{});
        self.renderer.init(); // lazy init
        if ( 2 === n )
        {
            self.renderer.drawLine(points[0], points[1], opts.line.size, opts.line.color, opts.line.style);
        }
        else if ( 4 <= points.length )
        {
            for(i=0; i<n; i+=4)
                self.renderer.drawBezier([points[i], points[i+1], points[i+2], points[i+3]], opts.line.size, opts.line.color, opts.line.style);
        }
        return self;
    }

    ,label: function( pos, size, text, opts ) {
        var self = this;
        self.renderer.init(); // lazy init
        self.renderer.drawLabel(pos, size, text, extend(true, clone(self.opts), opts||{}));
        return self;
    }

    ,graph: function( f, x0, x1, opts ) {
        var self = this, data, points, vm, vw, vh, w, h, o, s,
            padl, padr, padt, padb, boundingBox,
            scx, scy, st0, st0n, stx, sty, t0, t0n, ts,
            tx = [], ty = [], txn = [], tyn = [], i, j, n, k,
            evtHandler
        ;

        opts = extend(true, clone(self.opts), opts||{});

        scx = opts.axes && opts.axes.x && opts.axes.x.ticks && ('log' === opts.axes.x.ticks.scale) ? /*log*/lin : lin;
        scy = opts.axes && opts.axes.y && opts.axes.y.ticks && ('log' === opts.axes.y.ticks.scale) ? /*log*/lin : lin;

        padl = stdMath.max(0, opts.padding ? opts.padding.left||0 : 0);
        padr = stdMath.max(0, opts.padding ? opts.padding.right||0 : 0);
        padt = stdMath.max(0, opts.padding ? opts.padding.top||0 : 0);
        padb = stdMath.max(0, opts.padding ? opts.padding.bottom||0 : 0);

        data = is_array(f) ? f : self.sample(f, x0, x1, opts);
        points = data.map(function(pt){return pt.apply(scx, scy);});

        self.renderer.init(); // lazy init
        vw = self.renderer.width();
        vh = self.renderer.height();
        boundingBox = self.boundingBox(points);
        w = (boundingBox.max.x-boundingBox.min.x)+EPS;
        h = (boundingBox.max.y-boundingBox.min.y)+EPS;
        s = stdMath.min((vw-padl-padr)/w, (vh-padt-padb)/h);
        vm = new Matrix().translate(-boundingBox.min.x, -boundingBox.min.y).scale(s).translate(padl+((vw-padl-padr)-s*w)/2, padt+((vh-padt-padb)-s*h)/2);
        o = vm.transform(new Point(0, 0)).apply(stdMath.round);

        if ( opts.axes )
        {
            if ( opts.axes.y && opts.axes.y.ticks )
            {
                sty = 'auto' === opts.axes.y.ticks.step ? h/8 : opts.axes.y.ticks.step;
                ts = stdMath.round(s*sty);
                if ( 0 < ts )
                {
                    t0 = o.y; n = 0;
                    // t0 - n*ts <= v ==> n = stdMath.ceil((t0-v)/ts)
                    if ( vh < t0 )
                    {
                        k = stdMath.ceil((t0-vh)/ts);
                        n -= k;
                        t0 -= k*ts;
                    }
                    // t0 + n*ts >= 0 ==> n = stdMath.ceil(-t0/ts)
                    if ( 0 > t0 )
                    {
                        k = stdMath.ceil(-t0/ts);
                        n += k;
                        t0 += k*ts;
                    }
                    i = t0===o.y ? 1 : 0;
                    j = -1;
                    t0n = t0+j*ts;
                    t0 = t0+i*ts;
                    st0 = scy(t0);
                    st0n = scy(t0n);
                    while(st0 <= vh-padb || st0n >= padt )
                    {
                        if ( padt <= st0 && st0 <= vh-padb )
                        {
                            self.renderer.drawLine({x:padl, y:vh-st0}, {x:vw-padr, y:vh-st0}, opts.axes.y.ticks.size, opts.axes.y.ticks.color, opts.axes.y.ticks.style);
                            ty.push({y:vh-st0, v:(n+i)*sty});
                        }
                        if ( padt <= st0n && st0n <= vh-padb )
                        {
                            self.renderer.drawLine({x:padl, y:vh-st0n}, {x:vw-padr, y:vh-st0n}, opts.axes.y.ticks.size, opts.axes.y.ticks.color, opts.axes.y.ticks.style);
                            tyn.push({y:vh-st0n, v:(n+j)*sty});
                        }
                        t0 += ts; t0n -= ts; i++; j--;
                        st0 = scy(t0);
                        st0n = scy(t0n);
                    }
                }
            }

            if ( opts.axes.x && opts.axes.x.ticks )
            {
                stx = 'auto' === opts.axes.x.ticks.step ? w/8 : opts.axes.x.ticks.step;
                ts = stdMath.round(s*stx);
                if ( 0 < ts )
                {
                    t0 = o.x; n = 0;
                    // t0 - n*ts <= v ==> n = stdMath.ceil((t0-v)/ts)
                    if ( vw < t0 )
                    {
                        k = stdMath.ceil((t0-vw)/ts);
                        n -= k;
                        t0 -= k*ts;
                    }
                    // t0 + n*ts >= 0 ==> n = stdMath.ceil(-t0/ts)
                    if ( 0 > t0 )
                    {
                        k = stdMath.ceil(-t0/ts);
                        n += k;
                        t0 += k*ts;
                    }
                    i = t0===o.x ? 1 : 0;
                    j = -1;
                    t0n = t0+j*ts;
                    t0 = t0+i*ts;
                    st0 = scx(t0);
                    st0n = scx(t0n);
                    while(st0 <= vw-padr || st0n >= padl)
                    {
                        if ( padl <= st0 && st0 <= vw-padr )
                        {
                            self.renderer.drawLine({x:st0, y:vh-padb}, {x:st0, y:padt}, opts.axes.x.ticks.size, opts.axes.x.ticks.color, opts.axes.x.ticks.style);
                            tx.push({x:st0, v:(n+i)*stx});
                        }
                        if ( padl <= st0n && st0n <= vh-padr )
                        {
                            self.renderer.drawLine({x:st0n, y:vh-padb}, {x:st0n, y:padt}, opts.axes.x.ticks.size, opts.axes.x.ticks.color, opts.axes.x.ticks.style);
                            txn.push({x:st0n, v:(n+j)*stx});
                        }
                        t0 += ts; t0n -= ts; i++; j--;
                        st0 = scx(t0);
                        st0n = scx(t0n);
                    }
                }
            }

            // draw x-axis
            if ( opts.axes.x && (o.y >= padt) && (o.y <= vh-padb) )
            {
                self.renderer.drawLine({x:padl, y:vh-o.y}, {x:vw-padr, y:vh-o.y}, opts.axes.x.size, opts.axes.x.color, opts.axes.x.style);
            }

            // draw y-axis
            if ( opts.axes.y && (o.x >= padl) && (o.x <= vw-padr) )
            {
                self.renderer.drawLine({x:o.x, y:padt}, {x:o.x, y:vh-padb}, opts.axes.y.size, opts.axes.y.color, opts.axes.y.style);
            }
        }

        points = points.map(function(pt){return vm.transform(pt);});
        evtHandler = function( type, obj, coords, evt ) {
            var tip = self.tooltip, t;
            if ( 'enter' === type )
            {
                tip.classList.remove('--plot-hide-tooltip');
                tip.classList.add('--plot-show-tooltip');
            }
            else if ( 'leave' === type )
            {
                tip.classList.remove('--plot-show-tooltip');
                tip.classList.add('--plot-hide-tooltip');
                return;
            }
            t = (coords.localX-obj.pos[0].x)/(obj.pos[1].x-obj.pos[0].x);
            tip.innerHTML = 'x: '+String(interpolate(obj.extra.p1.x, obj.extra.p2.x, t)) + '<br />y: ' + String(interpolate(obj.extra.p1.y, obj.extra.p2.y, t));
            tip.style.left = String(coords.pageX) + 'px';
            tip.style.top = String(coords.pageY) + 'px';
            /*if ( coords.pageX+tip.clientWidth > document.html.clientWidth )
            {
                tip.style.left = 'auto';
                tip.style.right = String(coords.pageX) + 'px';
            }
            if ( coords.pageY+tip.clientHeight > document.html.clientHeight )
            {
                tip.style.top = 'auto';
                tip.style.bottom = String(coords.pageY) + 'px';
            }*/
        };
        points = points.map(function(pt){ pt.y = vh-pt.y; return pt});
        for(i=0,n=points.length; i+1<n; i++)
        {
            if ( Point.isFinite(points[i]) && Point.isFinite(points[i+1]) )
            {
                self.renderer.drawLine(points[i], points[i+1], opts.line.size, opts.line.color, opts.line.style, {
                    p1:data[i], p2:data[i+1],
                    listener:{'enter':evtHandler,'leave':evtHandler,'move':evtHandler}
                });
            }
        }

        if ( opts.axes )
        {
            if ( opts.axes.x && opts.axes.x.ticks && opts.axes.x.ticks.text && 0<opts.axes.x.ticks.text.size && (tx.length||txn.length) )
            {
                t0 = (o.y >= padt) && (o.y <= vh-padb) ? vh-o.y-5 : vh-padb-5;
                ts = stdMath.ceil(tx.length/3);
                for(i=0; i<tx.length; i+=ts)
                {
                    if ( 0 === tx[i].v ) continue;
                    self.renderer.drawText({x:tx[i].x+2, y:t0}, tx[i].v, opts.axes.x.ticks.text.size, opts.axes.x.ticks.text.color);
                }
                ts = stdMath.ceil(txn.length/3);
                for(i=0; i<txn.length; i+=ts)
                {
                    if ( 0 === txn[i].v ) continue;
                    self.renderer.drawText({x:txn[i].x+2, y:t0}, txn[i].v, opts.axes.x.ticks.text.size, opts.axes.x.ticks.text.color);
                }
            }
            if ( opts.axes.y && opts.axes.y.ticks && opts.axes.y.ticks.text && 0<opts.axes.y.ticks.text.size && (ty.length||tyn.length) )
            {
                t0 = (o.x >= padl) && (o.x <= vw-padr) ? o.x+5 : padl+5;
                ts = stdMath.ceil(ty.length/3);
                for(i=0; i<ty.length; i+=ts)
                {
                    if ( 0 === ty[i].v ) continue;
                    self.renderer.drawText({x:t0, y:ty[i].y-2}, ty[i].v, opts.axes.y.ticks.text.size, opts.axes.y.ticks.text.color);
                }
                ts = stdMath.ceil(tyn.length/3);
                for(i=0; i<tyn.length; i+=ts)
                {
                    if ( 0 === tyn[i].v ) continue;
                    self.renderer.drawText({x:t0, y:tyn[i].y-2}, tyn[i].v, opts.axes.y.ticks.text.size, opts.axes.y.ticks.text.color);
                }
            }
        }
        return self;
    }

    ,chart: function( type, data, opts ) {
        var self = this, points, vw, vh, vm, s, o, min, range,
            t0, t0n, ts, v = [], vn = [], bar, bar2, sbar, spc = 0.2,
            i, j, n, k, st, ticks = null, vs, pad1, pad2, total = null,
            boundingBox = null, padl, padr, padt, padb, ptext, evtHandler;

        type = String(type || 'vbar').toLowerCase();
        if ( 'bar' === type ) type = 'vbar';

        opts = extend(true, clone(self.opts), opts||{});

        opts.colors = opts.colors || palette(data.length);
        opts.labels = opts.labels || labels(data.length);
        padl = stdMath.max(0, opts.padding ? opts.padding.left||0 : 0);
        padr = stdMath.max(0, opts.padding ? opts.padding.right||0 : 0);
        padt = stdMath.max(0, opts.padding ? opts.padding.top||0 : 0);
        padb = stdMath.max(0, opts.padding ? opts.padding.bottom||0 : 0);

        n = data.length;

        self.renderer.init(); // lazy init
        vw = self.renderer.width();
        vh = self.renderer.height();

        if ( 'pie'===type || 'doughnut'===type )
        {
            total = 0;
            for(i=0; i<data.length; i++)
                total += is_finite(data[i]) ? stdMath.abs(data[i]) : 0;
        }
        else
        {
            if ( 'hbar'===type )
                ticks = (opts.axes && opts.axes.x ? opts.axes.x.ticks : null) || null;
            else if ( 'vbar'===type || 'line'===type )
                ticks = (opts.axes && opts.axes.y ? opts.axes.y.ticks : null) || null;

            points = data.map(function(y, x){return new Point(x, y);});
            boundingBox = self.boundingBox(points);

            if ( 'hbar'===type )
            {
                vs = vw;
                pad1 = padl;
                pad2 = padr;
                if ( ticks && ticks.text && 0<ticks.text.size )
                {
                    ptext = vh-padb-2;
                    padb += 2*ticks.text.size;
                }
                bar = stdMath.max(1, (vh-padb-padt)/(n+spc*(n-1)));
            }
            else
            {
                vs = vh;
                pad1 = padt;
                pad2 = padb;
                if ( ticks && ticks.text && 0<ticks.text.size )
                {
                    ptext = padl+2;
                    padl += 2*ticks.text.size;
                }
                bar = 'line'===type ? stdMath.max(1, (vw-padl-padr)/(n)) : stdMath.max(1, (vw-padl-padr)/(n+spc*(n-1)));
            }
            min = 0>boundingBox.min.y ? -boundingBox.min.y : 0;
            range = boundingBox.max.y+min;
            s = (vs-pad1-pad2)/range;
            o = pad1 + s*min;
            bar2 = bar/2; //sbar = stdMath.max(1, spc*bar);
            vm = new Matrix().scale(1, s);
            if ( opts.axes )
            {
                if ( ticks )
                {
                    st = 'auto' === ticks.step ? range/8 : ticks.step;
                    ts = stdMath.round(s*st);
                    if ( 0 < ts )
                    {
                        t0 = o; n = 0;
                        // t0 - n*ts <= v ==> n = stdMath.ceil((t0-v)/ts)
                        if ( vs < t0 )
                        {
                            k = stdMath.ceil((t0-vs)/ts);
                            n -= k;
                            t0 -= k*ts;
                        }
                        // t0 + n*ts >= 0 ==> n = stdMath.ceil(-t0/ts)
                        if ( 0 > t0 )
                        {
                            k = stdMath.ceil(-t0/ts);
                            n += k;
                            t0 += k*ts;
                        }
                        i = t0===o ? 1 : 0;
                        j = -1;
                        t0n = t0+j*ts;
                        t0 = t0+i*ts;
                        while(t0 <= vs-pad2 || t0n >= pad1)
                        {
                            if ( pad1 <= t0 && t0 <= vs-pad2 )
                            {
                                self.renderer.drawLine('hbar'===type?{y:padt, x:t0}:{x:padl, y:vh-t0}, 'hbar'===type?{y:vh-padb, x:t0}:{x:vw-padr, y:vh-t0}, ticks.size, ticks.color, ticks.style);
                                v.push({p:'hbar'===type?t0:vh-t0, v:(n+i)*st});
                            }
                            if ( pad1 <= t0n && t0n <= vs-pad2 )
                            {
                                self.renderer.drawLine('hbar'===type?{y:padt, x:t0n}:{x:padl, y:vh-t0n}, 'hbar'===type?{y:vh-padb, x:t0n}:{x:vw-padr, y:vh-t0n}, ticks.size, ticks.color, ticks.style);
                                vn.push({p:'hbar'===type?t0n:vh-t0n, v:(n+j)*st});
                            }
                            t0 += ts; t0n -= ts; i++; j--;
                        }
                    }
                }
            }
            points = points.map(function(pt){return vm.transform(pt);});
        }

        evtHandler = function( type, obj, coords, evt ) {
            var tip = self.tooltip;
            if ( 'enter' === type )
            {
                tip.classList.remove('--plot-hide-tooltip');
                tip.classList.add('--plot-show-tooltip');
                tip.innerHTML = obj.extra.label + '<br />' + obj.extra.value;
            }
            else if ( 'leave' === type )
            {
                tip.classList.remove('--plot-show-tooltip');
                tip.classList.add('--plot-hide-tooltip');
                return;
            }
            tip.style.left = String(coords.pageX) + 'px';
            tip.style.top = String(coords.pageY) + 'px';
            /*if ( coords.pageX+tip.clientWidth > document.html.clientWidth )
            {
                tip.style.left = 'auto';
                tip.style.right = String(coords.pageX) + 'px';
            }
            if ( coords.pageY+tip.clientHeight > document.html.clientHeight )
            {
                tip.style.top = 'auto';
                tip.style.bottom = String(coords.pageY) + 'px';
            }*/
        };
        if ( 'pie'===type || 'doughnut'===type )
        {
            bar = 0.4*stdMath.min(vw, vh);
            for(i=0,n=data.length,ts=0; i<n; i++)
            {
                if ( is_finite(data[i]) )
                {
                    st = stdMath.abs(data[i]);
                    self.renderer.drawSector({x:vw/2, y:vh/2}, bar, 360*ts/total, 360*(ts+st)/total, 0, opts.line.color, 'solid', opts.colors[i], {
                            label: opts.labels[i],
                            value: String(st),
                            listener: {
                                'enter':evtHandler,
                                'leave':evtHandler,
                                'move':evtHandler
                            }
                        });
                        ts += st;
                }
            }
            if ( 'doughnut'===type )
                self.renderer.drawEllipse({x:vw/2, y:vh/2}, {x:0.5*bar,y:0.5*bar}, 0, 0, opts.line.color, 'solid', opts.background.color);
        }
        else if ( 'line'===type )
        {
            for(i=0,n=points.length,ts=0; i+1<n; i++,ts+=bar)
            {
                if ( Point.isFinite(points[i]) && Point.isFinite(points[i+1]) )
                {
                    self.renderer.drawLine({x:padl+ts, y:vh-o-points[i].y}, {x:padl+ts+bar, y:vh-o-points[i+1].y}, opts.line.size, opts.line.color, opts.line.style);
                }
            }
            for(i=0,n=points.length,ts=0; i<n; i++,ts+=bar)
            {
                if ( Point.isFinite(points[i]) )
                {
                    self.renderer.drawPoint({x:padl+ts, y:vh-o-points[i].y}, opts.point.size, opts.colors[i], {
                            label: opts.labels[i],
                            value: String(data[i]),
                            listener: {
                                'enter':evtHandler,
                                'leave':evtHandler,
                                'move':evtHandler
                            }
                        });
                }
            }
        }
        else
        {
            for(i=0,n=points.length,ts=0; i<n; i++,ts+=bar)
            {
                if ( Point.isFinite(points[i]) )
                {
                    if ( 'hbar'===type )
                    {
                        self.renderer.drawRect({y:padt+bar2+ts+(0<i?spc*ts:0), x:o+points[i].y/2}, {y:bar, x:stdMath.abs(points[i].y)}, 0, 0, 'transparent', 'solid', opts.colors[i], {
                            label: opts.labels[i],
                            value: String(data[i]),
                            listener: {
                                'enter':evtHandler,
                                'leave':evtHandler,
                                'move':evtHandler
                            }
                        });
                    }
                    else
                    {
                        self.renderer.drawRect({x:padl+bar2+ts+(0<i?spc*ts:0), y:vh-o-points[i].y/2}, {x:bar, y:stdMath.abs(points[i].y)}, 0, 0, 'transparent', 'solid', opts.colors[i], {
                            label: opts.labels[i],
                            value: String(data[i]),
                            listener: {
                                'enter':evtHandler,
                                'leave':evtHandler,
                                'move':evtHandler
                            }
                        });
                    }
                }
            }
        }
        if ( opts.axes && ticks )
        {
            if ( ticks.text && 0<ticks.text.size && (v.length||vn.length) )
            {
                t0 = ptext;
                ts = stdMath.ceil(v.length/3);
                for(i=0; i<v.length; i+=ts)
                {
                    if ( 0 === v[i].v ) continue;
                    self.renderer.drawText('hbar'===type?{x:v[i].p+2, y:t0}:{y:v[i].p-2, x:t0}, v[i].v, ticks.text.size, ticks.text.color);
                }
                ts = stdMath.ceil(vn.length/3);
                for(i=0; i<vn.length; i+=ts)
                {
                    if ( 0 === vn[i].v ) continue;
                    self.renderer.drawText('hbar'===type?{x:vn[i].p+2, y:t0}:{y:vn[i].p-2, x:t0}, vn[i].v, ticks.text.size, ticks.text.color);
                }
            }
        }
        return self;
    }
};
Plot.VERSION = '1.0.0';
Plot.Util = {
    clone: clone,
    extend: extend,
    debounce: debounce,
    subdivide: subdividePath,
    hex2rgb: hex2rgb,
    rgb2hex: rgb2hex,
    hsb2rgb: hsb2rgb,
    rgb2hsb: rgb2hsb,
    palette: palette
};
Plot.Point = Point;
Plot.Matrix = Matrix;
Plot.Renderer = Renderer;
// export it
return Plot;
});
