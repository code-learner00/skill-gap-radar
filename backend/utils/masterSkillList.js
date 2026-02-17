// utils/masterSkillList.js
// MUST export a Set (not an array) for O(1) .has() lookups
'use strict';

const MASTER_SKILLS = new Set([
  // ── Languages ──────────────────────────────────────────────────────────
  'javascript','typescript','python','java','golang','rust','c','c++','c#',
  'ruby','php','kotlin','swift','scala','r','matlab','bash','shell',

  // ── Frontend ───────────────────────────────────────────────────────────
  'react','vuejs','angular','nextjs','svelte','html','css','tailwindcss',
  'redux','webpack','vite','storybook','jquery','bootstrap','sass',

  // ── Backend ────────────────────────────────────────────────────────────
  'nodejs','express','django','flask','fastapi','spring','rails','laravel',
  'nestjs','graphql','rest','grpc','websockets','hapi','koa',

  // ── Databases ──────────────────────────────────────────────────────────
  'mongodb','postgresql','mysql','sqlite','redis','elasticsearch',
  'cassandra','dynamodb','firebase','supabase','oracle','mssql',

  // ── DevOps / Cloud ─────────────────────────────────────────────────────
  'docker','kubernetes','aws','google cloud','azure','terraform','ansible',
  'cicd','github actions','jenkins','nginx','linux','unix','vagrant',

  // ── AI / ML ────────────────────────────────────────────────────────────
  'machine learning','deep learning','tensorflow','pytorch','scikit-learn',
  'pandas','numpy','natural language processing','computer vision','llm',

  // ── Testing ────────────────────────────────────────────────────────────
  'testing','jest','pytest','cypress','selenium','mocha','jasmine','vitest',

  // ── Tools / Practices ──────────────────────────────────────────────────
  'git','agile','scrum','system design','microservices','kafka','rabbitmq',
  'oauth','jwt','security','blockchain','solidity','figma','jira',
]);

module.exports = MASTER_SKILLS;