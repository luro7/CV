import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gallerySwipeDirection,lockGalleryPage} from '../public/js/project-gallery.js';
test('gallery locks background and restores existing styles and exact scroll position',()=>{
 const style={position:'relative',top:'',left:'',width:'',overflow:'auto',paddingRight:'8px'};
 const original={...style};let restored;
 const page={scrollX:0,scrollY:1234,innerWidth:390,document:{body:{style},documentElement:{clientWidth:380,style:{overflow:'clip'}}},getComputedStyle:()=>({paddingRight:'8px'}),scrollTo:value=>restored=value};
 const unlock=lockGalleryPage(page);
 assert.equal(style.position,'fixed');assert.equal(style.top,'-1234px');
 assert.equal(style.paddingRight,'18px');assert.equal(page.document.documentElement.style.overflow,'hidden');
 unlock();assert.deepEqual(style,original);assert.equal(page.document.documentElement.style.overflow,'clip');
 assert.deepEqual(restored,{left:0,top:1234,behavior:'instant'});
});
test('gallery horizontal swipes navigate both ways without treating vertical gestures as navigation',()=>{
 assert.equal(gallerySwipeDirection(-100,10),1);
 assert.equal(gallerySwipeDirection(100,10),-1);
 for(const [x,y] of [[10,100],[100,100],[20,0],[0,-100]]) assert.equal(gallerySwipeDirection(x,y),0);
});
test('career indicator does not intercept touch, wheel or page scrolling',()=>{
 const source=readFileSync('public/js/modules/career-timeline.js','utf8');
 assert.doesNotMatch(source,/touchstart|touchmove|touchend|wheel/);
 assert.doesNotMatch(source,/scrollTo|preventDefault/);
 assert.match(source,/addEventListener\('scroll', schedule, \{ passive: true \}\)/);
});
