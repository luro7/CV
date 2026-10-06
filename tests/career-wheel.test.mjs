import test from 'node:test';
import assert from 'node:assert/strict';
import { careerScrollDecision as decide, careerAlignmentOffset } from '../public/js/modules/career-wheel-model.js';
for(const viewport of [640,800,1080,2160]) {
 test(`short companies keep their top position in either direction at ${viewport}px`,()=>{
  for(const height of [180,400,viewport-24]) {
   for(const edge of ['top','bottom']) assert.equal(careerAlignmentOffset({top:24,bottom:24+height,anchor:24,viewport,edge}),0);
  }
 });
 test(`long companies still enter at their bottom on reverse scroll at ${viewport}px`,()=>{
  assert.equal(careerAlignmentOffset({top:24,bottom:viewport+600,anchor:24,viewport,edge:'bottom'}),600);
 });
}
for (const index of [0,1,2]) {
 test(`downward realignment never returns company ${index} to an earlier company`,()=>{
  assert.deepEqual(decide({anchor:24,viewport:800,index,count:3,direction:1,previousTop:80,previousBottom:600,top:-100,bottom:420}),{index,edge:'top'});
 });
 test(`upward realignment never advances company ${index} to a later company`,()=>{
  assert.deepEqual(decide({anchor:24,viewport:800,index,count:3,direction:-1,previousTop:-600,previousBottom:0,top:-500,bottom:100}),{index,edge:'bottom'});
 });
}
for(const viewport of [640,800,1080,2160]) {
  const base={anchor:24,viewport,index:0,count:3,direction:1};
  test(`entry cannot skip career with a multi-page jump at ${viewport}px`,()=>{
    assert.deepEqual(decide({...base,previousTop:500,previousBottom:900,top:-5000,bottom:-4600}),{index:0,edge:'top'});
  });
  test(`long content is readable before the next company at ${viewport}px`,()=>{
    assert.deepEqual(decide({...base,previousTop:24,previousBottom:viewport+600,top:-500,bottom:viewport-10}),{index:0,edge:'bottom'});
  });
  test(`short content advances exactly one company at ${viewport}px`,()=>{
    assert.deepEqual(decide({...base,previousTop:24,previousBottom:400,top:-5000,bottom:-4600}),{index:1,edge:'top'});
  });
  test(`return enters the previous company by its bottom at ${viewport}px`,()=>{
    assert.deepEqual(decide({...base,index:1,direction:-1,previousTop:24,previousBottom:400,top:5000,bottom:5400}),{index:0,edge:'bottom'});
  });
  test(`last company releases page scrolling at ${viewport}px`,()=>{
    assert.equal(decide({...base,index:2,previousTop:24,previousBottom:400,top:-400,bottom:0}),null);
  });
  test(`first company releases upward scrolling at ${viewport}px`,()=>{
    assert.equal(decide({...base,direction:-1,previousTop:24,previousBottom:400,top:500,bottom:900}),null);
  });
}
test('returning from below enters last company rather than skipping the career',()=>{
 assert.deepEqual(decide({anchor:24,viewport:800,index:2,count:3,direction:-1,previousTop:-600,previousBottom:-100,top:5000,bottom:5500}),{index:2,edge:'bottom'});
});
test('scrolling back through a long chapter reaches its top before the previous company',()=>{
 assert.deepEqual(decide({anchor:24,viewport:800,index:1,count:3,direction:-1,previousTop:-600,previousBottom:700,top:80,bottom:1380}),{index:1,edge:'top'});
});
for(const contentHeight of [180,600,1200,4000]) {
 test(`content changes to ${contentHeight}px do not require a fixed section reservation`,()=>{
   const viewport=800,anchor=24,previousTop=24,previousBottom=previousTop+contentHeight;
   const delta=5000;
   const result=decide({anchor,viewport,index:0,count:3,direction:1,previousTop,previousBottom,top:previousTop-delta,bottom:previousBottom-delta});
   assert.deepEqual(result,contentHeight>viewport-anchor+2?{index:0,edge:'bottom'}:{index:1,edge:'top'});
 });
}
test('fractional pixel alignment does not repeatedly reset the first company',()=>{
 assert.deepEqual(decide({anchor:24,viewport:800,index:1,count:3,direction:1,previousTop:24.13,previousBottom:500.13,top:23.93,bottom:499.93}),{index:2,edge:'top'});
});
