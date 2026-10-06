import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gallerySwipeDirection} from '../public/js/project-gallery.js';
test('gallery horizontal swipes navigate both ways without treating vertical gestures as navigation',()=>{
 assert.equal(gallerySwipeDirection(-100,10),1);
 assert.equal(gallerySwipeDirection(100,10),-1);
 for(const [x,y] of [[10,100],[100,100],[20,0],[0,-100]]) assert.equal(gallerySwipeDirection(x,y),0);
});
test('touch career exits before scroll interception and keeps all companies in native flow',()=>{
 const source=readFileSync('public/js/modules/career-timeline.js','utf8');
 assert.match(source,/pointer: coarse/);
 assert.ok(source.indexOf('return;\n  }\n  const motion')<source.indexOf("window.addEventListener('scroll'"));
 assert.match(source,/panels\[index\]\.scrollIntoView/);
});
