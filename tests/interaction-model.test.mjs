import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCapabilityModel, progressToStage, rankCommandItems, skillMatchesExperience } from '../public/js/modules/interaction-model.js';

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

test('capability model groups skills, derives importance and relates shared experience',()=>{
  const expertise=[{number:'01',title:'Data engineering',tools:['SQL Development','SQL Server','ETL']}];
  const experience=[
    {id:'role-a',tools:['SQL Server','ETL']},
    {id:'role-b',tools:['SQL Server']}
  ];
  const types={'SQL Development':'Skill','SQL Server':'Technology','ETL':'Process'};
  const links={'SQL Development':['role-a','role-b']};
  const model=buildCapabilityModel(expertise,experience,types,links);
  const sql=model.nodes.find(node=>node.skill==='SQL Development');
  assert.equal(model.groups.length,1);
  assert.equal(model.nodes.length,3);
  assert.deepEqual(sql.roleIds,['role-a','role-b']);
  assert.equal(sql.importance,3);
  assert(model.relatedBySkill['SQL Development'].includes('SQL Server'));
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
