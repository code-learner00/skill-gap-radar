// utils/skillDictionary.js
// Plain object alias map — normalizes common variants to canonical names
// Keys and values must both be strings present in MASTER_SKILLS (or map to one)
'use strict';

const SKILL_DICT = {
  // React
  'reactjs':          'react',
  'react.js':         'react',
  'react js':         'react',
  // Node
  'node':             'nodejs',
  'node.js':          'nodejs',
  'node js':          'nodejs',
  // Express
  'expressjs':        'express',
  'express.js':       'express',
  // MongoDB
  'mongo':            'mongodb',
  'mongoose':         'mongodb',
  // PostgreSQL
  'postgres':         'postgresql',
  'pg':               'postgresql',
  'psql':             'postgresql',
  // Kubernetes
  'k8s':              'kubernetes',
  'kube':             'kubernetes',
  // JavaScript / TypeScript
  'js':               'javascript',
  'ts':               'typescript',
  'es6':              'javascript',
  'es2015':           'javascript',
  // Python
  'py':               'python',
  // Vue
  'vue':              'vuejs',
  'vue.js':           'vuejs',
  // Next.js
  'next':             'nextjs',
  'next.js':          'nextjs',
  // AWS
  'aws lambda':       'aws',
  'amazon s3':        'aws',
  'amazon web services': 'aws',
  'ec2':              'aws',
  // GCP
  'gcp':              'google cloud',
  'google cloud platform': 'google cloud',
  // Azure
  'microsoft azure':  'azure',
  // CI/CD
  'ci/cd':            'cicd',
  'ci cd':            'cicd',
  'continuous integration': 'cicd',
  'continuous deployment':  'cicd',
  // CSS variants
  'scss':             'css',
  'less':             'css',
  'tailwind':         'tailwindcss',
  // REST
  'rest api':         'rest',
  'restful':          'rest',
  'restful api':      'rest',
  // GraphQL
  'graphql api':      'graphql',
  // ML
  'ml':               'machine learning',
  'ai':               'machine learning',
  'nlp':              'natural language processing',
  'cv':               'computer vision',
  // Testing
  'unit testing':     'testing',
  'integration testing': 'testing',
  'e2e':              'testing',
  'tdd':              'testing',
  // Redux
  'redux toolkit':    'redux',
  'redux-toolkit':    'redux',
  // Linux
  'unix':             'linux',
  // Spring
  'spring boot':      'spring',
  'spring framework': 'spring',
  // Django REST
  'django rest':      'django',
  'drf':              'django',
  // FastAPI
  'fast api':         'fastapi',
  // Git
  'github':           'git',
  'gitlab':           'git',
  'bitbucket':        'git',
  // Docker
  'docker compose':   'docker',
  'dockerfile':       'docker',
  // Terraform
  'terraform cloud':  'terraform',
  // Kafka
  'apache kafka':     'kafka',
  // RabbitMQ
  'rabbit mq':        'rabbitmq',
  // Elasticsearch
  'elastic search':   'elasticsearch',
  'elk':              'elasticsearch',
  // Agile
  'kanban':           'agile',
  'sprint':           'scrum',
};

module.exports = SKILL_DICT;