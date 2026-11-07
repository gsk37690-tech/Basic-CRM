import { Request, Response } from 'express';

export const getPostmanCollection = (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  const postmanCollection = {
    info: {
      _postman_id: 'college-crm-project-v2',
      name: 'College CRM REST API Collection',
      description: 'Complete Postman API test collection for college submission (Auth, Leads, Contacts, Deals, Activities, FollowUps, Dashboard)',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      { key: 'baseUrl', value: baseUrl, type: 'string' },
      { key: 'token', value: '', type: 'string' },
    ],
    item: [
      {
        name: 'Authentication',
        item: [
          {
            name: 'Login (Admin)',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ email: 'admin@collegecrm.edu', password: 'password123' }, null, 2),
              },
              url: { raw: '{{baseUrl}}/api/auth/login', host: ['{{baseUrl}}'], path: ['api', 'auth', 'login'] },
            },
          },
          {
            name: 'Register User',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  name: 'Test Executive',
                  email: 'test.exec@collegecrm.edu',
                  password: 'password123',
                  role: 'Sales Executive',
                  phone: '+1 555-0199',
                }, null, 2),
              },
              url: { raw: '{{baseUrl}}/api/auth/register', host: ['{{baseUrl}}'], path: ['api', 'auth', 'register'] },
            },
          },
          {
            name: 'Get Current Profile (Me)',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: { raw: '{{baseUrl}}/api/auth/me', host: ['{{baseUrl}}'], path: ['api', 'auth', 'me'] },
            },
          },
        ],
      },
      {
        name: 'Leads Management',
        item: [
          {
            name: 'List Leads (with filter & pagination)',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: {
                raw: '{{baseUrl}}/api/leads?status=All&quality=All&page=1&limit=10',
                host: ['{{baseUrl}}'],
                path: ['api', 'leads'],
                query: [
                  { key: 'status', value: 'All' },
                  { key: 'quality', value: 'All' },
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '10' },
                ],
              },
            },
          },
          {
            name: 'Create New Lead',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  name: 'Michael Scott',
                  company: 'Scranton Paper Co',
                  email: 'mscott@scrantonpaper.com',
                  phone: '+1 555-0144',
                  source: 'Website',
                  status: 'Qualified',
                  quality: 'Hot',
                  estimatedValue: 35000,
                  notes: 'Direct inbound lead interested in 1-year contract.',
                }, null, 2),
              },
              url: { raw: '{{baseUrl}}/api/leads', host: ['{{baseUrl}}'], path: ['api', 'leads'] },
            },
          },
          {
            name: 'Convert Lead to Contact & Deal',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  dealTitle: 'Scranton Paper Co - Annual License',
                  expectedCloseDate: '2026-04-15',
                }, null, 2),
              },
              url: { raw: '{{baseUrl}}/api/leads/:leadId/convert', host: ['{{baseUrl}}'], path: ['api', 'leads', ':leadId', 'convert'] },
            },
          },
        ],
      },
      {
        name: 'Deals & Pipeline',
        item: [
          {
            name: 'List Pipeline Deals',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: { raw: '{{baseUrl}}/api/deals', host: ['{{baseUrl}}'], path: ['api', 'deals'] },
            },
          },
          {
            name: 'Update Deal Stage',
            request: {
              method: 'PUT',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ stage: 'Closed Won' }, null, 2),
              },
              url: { raw: '{{baseUrl}}/api/deals/:id', host: ['{{baseUrl}}'], path: ['api', 'deals', ':id'] },
            },
          },
        ],
      },
      {
        name: 'Follow-ups & Activities',
        item: [
          {
            name: 'Get Follow-Ups',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: { raw: '{{baseUrl}}/api/followups?status=Pending', host: ['{{baseUrl}}'], path: ['api', 'followups'] },
            },
          },
          {
            name: 'Log Call/Meeting Activity',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  leadId: 'lead_101',
                  type: 'Call',
                  summary: 'Reviewed proposal pricing',
                  details: 'Client confirmed budget availability for Q2.',
                }, null, 2),
              },
              url: { raw: '{{baseUrl}}/api/activities', host: ['{{baseUrl}}'], path: ['api', 'activities'] },
            },
          },
        ],
      },
      {
        name: 'Dashboard Analytics',
        item: [
          {
            name: 'Get CRM Aggregates',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: { raw: '{{baseUrl}}/api/dashboard/stats', host: ['{{baseUrl}}'], path: ['api', 'dashboard', 'stats'] },
            },
          },
        ],
      },
    ],
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="college-crm-postman-collection.json"');
  return res.json(postmanCollection);
};

export const getAcademicSpecs = (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      projectTitle: 'Basic CRM (Customer Relationship Management)',
      courseModule: 'Full-Stack Web Development / Academic Project #2',
      architecture: 'MERN Stack (MongoDB/Mongoose Schemas, ExpressJS, ReactJS, Node.js)',
      models: [
        {
          name: 'User',
          description: 'System operator and staff profiles',
          fields: ['id (PK)', 'name', 'email (unique)', 'passwordHash (bcrypt)', 'role (Admin | Manager | Executive)', 'phone', 'createdAt'],
        },
        {
          name: 'Lead',
          description: 'Prospective client capturing pipeline inquiries',
          fields: ['id (PK)', 'name', 'company', 'email', 'phone', 'source', 'status', 'quality (Hot/Warm/Cold)', 'assignedTo (FK -> User)', 'estimatedValue', 'notes', 'createdAt'],
        },
        {
          name: 'Activity',
          description: 'Interaction logs including calls, emails, meetings, and notes',
          fields: ['id (PK)', 'leadId (FK -> Lead)', 'dealId (FK -> Deal)', 'type (Call/Email/Meeting/Note)', 'summary', 'details', 'performedBy (FK -> User)', 'createdAt'],
        },
        {
          name: 'FollowUp',
          description: 'Scheduled reminders with status tracking',
          fields: ['id (PK)', 'leadId (FK -> Lead)', 'scheduledDate', 'scheduledTime', 'type', 'status (Pending/Completed/Cancelled)', 'assignedTo (FK -> User)', 'createdAt'],
        },
        {
          name: 'Contact',
          description: 'Established customer directory generated on lead qualification',
          fields: ['id (PK)', 'name', 'company', 'email', 'phone', 'position', 'leadId (FK -> Lead)', 'assignedTo (FK -> User)', 'createdAt'],
        },
        {
          name: 'Deal',
          description: 'Revenue pipeline opportunity tracking through sales stages',
          fields: ['id (PK)', 'title', 'company', 'value (Currency)', 'stage (Prospecting -> Won/Lost)', 'expectedCloseDate', 'contactId (FK -> Contact)', 'assignedTo (FK -> User)', 'probability'],
        },
      ],
      relationships: [
        'User 1:N Lead (User is assigned to manage multiple Leads)',
        'Lead 1:N Activity (Lead has historical logs of calls and notes)',
        'Lead 1:N FollowUp (Lead has scheduled upcoming follow-ups)',
        'Lead 1:1 Contact (Qualified Lead converts into a permanent Contact)',
        'Contact 1:N Deal (Contact can hold one or more revenue Deals)',
        'User 1:N Deal (Sales Rep manages assigned Deals in pipeline)',
      ],
    },
  });
};
