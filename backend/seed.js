
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Customer = require('./models/Customer');
const Lead = require('./models/Lead');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // 1. Create sample users
    const password = await bcrypt.hash('Password@123', 10);

    const sampleUsers = [
      {
        name: 'CRM Admin',
        email: 'admin@acxiom.com',
        role: 'Admin'
      },
      {
        name: 'Rahul Manager',
        email: 'manager@acxiom.com',
        role: 'Manager'
      },
      {
        name: 'Amit Sales',
        email: 'amit@acxiom.com',
        role: 'Sales Executive'
      },
      {
        name: 'Priya Sales',
        email: 'priya@acxiom.com',
        role: 'Sales Executive'
      }
    ];

    const users = {};

    for (const userData of sampleUsers) {
      let user = await User.findOne({ email: userData.email });

      if (!user) {
        user = await User.create({
          ...userData,
          password
        });

        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }

      users[userData.email] = user;
    }

    const admin = users['admin@acxiom.com'];
    const amit = users['amit@acxiom.com'];
    const priya = users['priya@acxiom.com'];

    // 2. Create sample customers
    const sampleCustomers = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        address: 'Shillong, Meghalaya',
        status: 'Active',
        assignedTo: amit._id,
        createdBy: admin._id,
        notes: 'Interested in CRM software.'
      },
      {
        name: 'Priya Verma',
        email: 'priya.verma@example.com',
        phone: '9876543211',
        address: 'Guwahati, Assam',
        status: 'Active',
        assignedTo: priya._id,
        createdBy: admin._id,
        notes: 'Existing business customer.'
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        phone: '9876543212',
        address: 'Patna, Bihar',
        status: 'Inactive',
        assignedTo: amit._id,
        createdBy: admin._id,
        notes: 'Follow-up required.'
      },
      {
        name: 'Neha Singh',
        email: 'neha@example.com',
        phone: '9876543213',
        address: 'Kolkata, West Bengal',
        status: 'Active',
        assignedTo: priya._id,
        createdBy: admin._id,
        notes: 'Interested in enterprise services.'
      }
    ];

    const customers = {};

    for (const customerData of sampleCustomers) {
      let customer = await Customer.findOne({
        email: customerData.email
      });

      if (!customer) {
        customer = await Customer.create(customerData);
        console.log(`Created customer: ${customer.name}`);
      } else {
        console.log(`Customer already exists: ${customer.email}`);
      }

      customers[customerData.email] = customer;
    }

    // 3. Create sample leads
    const sampleLeads = [
      {
        name: 'Suresh Patel',
        email: 'suresh@example.com',
        phone: '9876543214',
        source: 'Website',
        status: 'New',
        expectedValue: 50000,
        assignedTo: amit._id,
        createdBy: admin._id,
        notes: 'Enquired through the website.'
      },
      {
        name: 'Anjali Das',
        email: 'anjali@example.com',
        phone: '9876543215',
        source: 'Referral',
        status: 'Contacted',
        expectedValue: 75000,
        assignedTo: priya._id,
        createdBy: admin._id,
        notes: 'Referred by an existing customer.'
      },
      {
        name: 'Vikash Gupta',
        email: 'vikash@example.com',
        phone: '9876543216',
        source: 'Social Media',
        status: 'Qualified',
        expectedValue: 100000,
        assignedTo: amit._id,
        createdBy: admin._id,
        notes: 'Interested in premium services.'
      },
      {
        name: 'Ritika Roy',
        email: 'ritika@example.com',
        phone: '9876543217',
        source: 'Advertisement',
        status: 'Lost',
        expectedValue: 30000,
        assignedTo: priya._id,
        createdBy: admin._id,
        notes: 'Not interested currently.'
      }
    ];

    for (const leadData of sampleLeads) {
      const existingLead = await Lead.findOne({
        email: leadData.email
      });

      if (!existingLead) {
        await Lead.create(leadData);
        console.log(`Created lead: ${leadData.name}`);
      } else {
        console.log(`Lead already exists: ${leadData.email}`);
      }
    }


    // 4. Fetch leads for relationships
    const leads = await Lead.find();

    const suresh = leads.find(
      lead => lead.email === 'suresh@example.com'
    );

    const anjali = leads.find(
      lead => lead.email === 'anjali@example.com'
    );

    const vikash = leads.find(
      lead => lead.email === 'vikash@example.com'
    );

    const rahul = customers['rahul@example.com'];
    const priyaCustomer = customers['priya.verma@example.com'];
    const neha = customers['neha@example.com'];

    // 5. Create sample follow-ups
    const followUps = [
      {
        title: 'Contact Suresh Patel',
        description: 'Discuss product requirements and pricing.',
        followUpDate: new Date(Date.now() + 86400000),
        status: 'Planned',
        relatedTo: 'Lead',
        lead: suresh._id,
        assignedTo: amit._id,
        createdBy: admin._id
      },
      {
        title: 'Follow up with Anjali',
        description: 'Share the service proposal.',
        followUpDate: new Date(Date.now() + 2 * 86400000),
        status: 'Planned',
        relatedTo: 'Lead',
        lead: anjali._id,
        assignedTo: priya._id,
        createdBy: admin._id
      },
      {
        title: 'Customer feedback',
        description: 'Collect feedback about current services.',
        followUpDate: new Date(Date.now() + 3 * 86400000),
        status: 'Planned',
        relatedTo: 'Customer',
        customer: rahul._id,
        assignedTo: amit._id,
        createdBy: admin._id
      },
      {
        title: 'Enterprise service discussion',
        description: 'Discuss enterprise package requirements.',
        followUpDate: new Date(Date.now() + 4 * 86400000),
        status: 'Planned',
        relatedTo: 'Customer',
        customer: neha._id,
        assignedTo: priya._id,
        createdBy: admin._id
      },
      {
        title: 'Pricing discussion completed',
        description: 'Discussed available pricing plans.',
        followUpDate: new Date(Date.now() - 86400000),
        status: 'Completed',
        relatedTo: 'Customer',
        customer: priyaCustomer._id,
        assignedTo: priya._id,
        createdBy: admin._id
      }
    ];

    const FollowUp = require('./models/FollowUp');

    for (const item of followUps) {
      const existing = await FollowUp.findOne({
        title: item.title,
        createdBy: item.createdBy
      });

      if (!existing) {
        await FollowUp.create(item);
        console.log(`Created follow-up: ${item.title}`);
      }
    }

    // 6. Create sample opportunities
    const opportunities = [
      {
        title: 'CRM Software Implementation',
        description: 'CRM implementation for a growing business.',
        amount: 150000,
        probability: 70,
        expectedCloseDate: new Date(Date.now() + 30 * 86400000),
        stage: 'Negotiation',
        relatedTo: 'Lead',
        lead: vikash._id,
        assignedTo: amit._id,
        createdBy: admin._id
      },
      {
        title: 'Enterprise Service Deal',
        description: 'Enterprise services for a large organization.',
        amount: 250000,
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 45 * 86400000),
        stage: 'Proposal',
        relatedTo: 'Customer',
        customer: neha._id,
        assignedTo: priya._id,
        createdBy: admin._id
      },
      {
        title: 'Customer Expansion',
        description: 'Additional services for an existing customer.',
        amount: 90000,
        probability: 50,
        expectedCloseDate: new Date(Date.now() + 20 * 86400000),
        stage: 'Qualification',
        relatedTo: 'Customer',
        customer: rahul._id,
        assignedTo: amit._id,
        createdBy: admin._id
      },
      {
        title: 'Cloud Services Contract',
        description: 'Cloud service subscription agreement.',
        amount: 180000,
        probability: 100,
        expectedCloseDate: new Date(Date.now() - 5 * 86400000),
        stage: 'Won',
        relatedTo: 'Customer',
        customer: priyaCustomer._id,
        assignedTo: priya._id,
        createdBy: admin._id
      },
      {
        title: 'Software Support Contract',
        description: 'Annual software support proposal.',
        amount: 45000,
        probability: 0,
        expectedCloseDate: new Date(Date.now() - 2 * 86400000),
        stage: 'Lost',
        relatedTo: 'Lead',
        lead: suresh._id,
        assignedTo: amit._id,
        createdBy: admin._id
      }
    ];

    const Opportunity = require('./models/Opportunity');

    for (const item of opportunities) {
      const existing = await Opportunity.findOne({
        title: item.title,
        createdBy: item.createdBy
      });

      if (!existing) {
        await Opportunity.create(item);
        console.log(`Created opportunity: ${item.title}`);
      }
    }

    // 7. Create sample activities
    const activities = [
      {
        subject: 'Initial sales call with Suresh',
        type: 'Call',
        description: 'Discussed customer requirements.',
        activityDate: new Date(Date.now() - 86400000),
        status: 'Completed',
        relatedTo: 'Lead',
        lead: suresh._id,
        assignedTo: amit._id,
        createdBy: admin._id
      },
      {
        subject: 'Product demonstration',
        type: 'Meeting',
        description: 'Demonstrated the CRM software.',
        activityDate: new Date(Date.now() + 86400000),
        status: 'Planned',
        relatedTo: 'Lead',
        lead: vikash._id,
        assignedTo: amit._id,
        createdBy: admin._id
      },
      {
        subject: 'Proposal email',
        type: 'Email',
        description: 'Sent enterprise pricing proposal.',
        activityDate: new Date(Date.now() - 2 * 86400000),
        status: 'Completed',
        relatedTo: 'Customer',
        customer: neha._id,
        assignedTo: priya._id,
        createdBy: admin._id
      },
      {
        subject: 'Prepare sales report',
        type: 'Task',
        description: 'Prepare the monthly sales report.',
        activityDate: new Date(Date.now() + 2 * 86400000),
        status: 'Planned',
        relatedTo: 'Customer',
        customer: rahul._id,
        assignedTo: amit._id,
        createdBy: admin._id
      },
      {
        subject: 'Follow-up call with Anjali',
        type: 'Call',
        description: 'Discussed the proposed service package.',
        activityDate: new Date(),
        status: 'Completed',
        relatedTo: 'Lead',
        lead: anjali._id,
        assignedTo: priya._id,
        createdBy: admin._id
      },
      {
        subject: 'Customer review meeting',
        type: 'Meeting',
        description: 'Review existing services and feedback.',
        activityDate: new Date(Date.now() + 3 * 86400000),
        status: 'Planned',
        relatedTo: 'Customer',
        customer: priyaCustomer._id,
        assignedTo: priya._id,
        createdBy: admin._id
      }
    ];

    const Activity = require('./models/Activity');

    for (const item of activities) {
      const existing = await Activity.findOne({
        subject: item.subject,
        createdBy: item.createdBy
      });

      if (!existing) {
        await Activity.create(item);
        console.log(`Created activity: ${item.subject}`);
      }
    }

    console.log('\nSample database records inserted successfully!');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

seedDatabase();
