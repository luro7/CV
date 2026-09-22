import test from 'node:test';
import assert from 'node:assert/strict';
import { progressToStage, rankCommandItems, skillMatchesExperience } from '../public/js/modules/interaction-model.js';

test('progress maps continuously into five pipeline stages',()=>{
  assert.equal(progressToStage(0),0);
  assert.equal(progressToStage(.19),0);
  assert.equal(progressToStage(.2),1);
  assert.equal(progressToStage(.81),4);
  assert.equal(progressToStage(1),4);
});

test('expertise matching supports exact tools and explicit conceptual role links',()=>{
  const links={'SQL Development':['role-a']};
  assert.equal(skillMatchesExperience('SQL Server','SQL Server|T-SQL','role-b',links),true);
  assert.equal(skillMatchesExperience('SQL Development','SQL Server|T-SQL','role-a',links),true);
  assert.equal(skillMatchesExperience('SQL Development','SQL Server|T-SQL','role-b',links),false);
});

test('command search prioritizes exact and prefix matches while preserving categories',()=>{
  const items=[
    {label:'SQL Server',group:'Technology',keywords:'SQL Server Technology'},
    {label:'SQL Development',group:'Skill',keywords:'SQL Development Skill'},
    {label:'Go to experience',group:'Navigate',keywords:'jobs work'}
  ];
  const ranked=rankCommandItems(items,'sql');
  assert.equal(ranked[0].label,'SQL Server');
  assert.equal(ranked[1].label,'SQL Development');
  assert.equal(ranked[0].group,'Technology');
});
