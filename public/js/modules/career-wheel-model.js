// All coordinates describe the active chapter in normal document flow.
export function careerAlignmentOffset({top,bottom,anchor,viewport,edge}) {
  // Short chapters share the same top anchor in both directions. Only a
  // chapter taller than the reading area needs entry at its bottom.
  return edge==='bottom' && bottom-top>viewport-anchor+2
    ? bottom-viewport : top-anchor;
}
export function careerScrollDecision({top,bottom,previousTop,previousBottom,direction,anchor,viewport,index,count}) {
  if(direction>0) {
    if(previousTop>anchor+2 && top<=anchor+2) return {index,edge:'top'};
    if(previousTop<=anchor+2 && previousBottom>viewport+2 && bottom<=viewport+2) return {index,edge:'bottom'};
    if(top<=anchor+2 && bottom<=viewport+2 && index<count-1) return {index:index+1,edge:'top'};
  } else if(direction<0) {
    if(previousBottom<anchor+2 && bottom>=anchor+2) return {index,edge:'bottom'};
    if(previousTop<anchor-2 && top>=anchor-2) return {index,edge:'top'};
    if(top>=anchor-2 && previousTop<viewport && index>0) return {index:index-1,edge:'bottom'};
  }
  return null;
}
