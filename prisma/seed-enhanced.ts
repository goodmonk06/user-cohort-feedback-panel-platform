import { PrismaClient, CampaignType, CampaignStatus, UserStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting enhanced seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.feedbackResponse.deleteMany()
  await prisma.campaignAnalytics.deleteMany()
  await prisma.cohortAnalytics.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.userTag.deleteMany()
  await prisma.cohortTag.deleteMany()
  await prisma.campaignTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.userPreference.deleteMany()
  await prisma.feedbackCampaign.deleteMany()
  await prisma.campaignTemplate.deleteMany()
  await prisma.cohortMember.deleteMany()
  await prisma.cohort.deleteMany()
  await prisma.panelUser.deleteMany()

  // Create Tags
  console.log('Creating tags...')
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'power-user', category: 'user-type', color: '#3B82F6' } }),
    prisma.tag.create({ data: { name: 'beta-tester', category: 'user-type', color: '#8B5CF6' } }),
    prisma.tag.create({ data: { name: 'early-adopter', category: 'user-type', color: '#10B981' } }),
    prisma.tag.create({ data: { name: 'enterprise', category: 'segment', color: '#F59E0B' } }),
    prisma.tag.create({ data: { name: 'individual', category: 'segment', color: '#6B7280' } }),
    prisma.tag.create({ data: { name: 'product-feedback', category: 'campaign', color: '#EC4899' } }),
    prisma.tag.create({ data: { name: 'ux-research', category: 'campaign', color: '#14B8A6' } }),
    prisma.tag.create({ data: { name: 'market-research', category: 'campaign', color: '#F97316' } }),
    prisma.tag.create({ data: { name: 'japan', category: 'region', color: '#DC2626' } }),
    prisma.tag.create({ data: { name: 'americas', category: 'region', color: '#2563EB' } }),
    prisma.tag.create({ data: { name: 'europe', category: 'region', color: '#16A34A' } })
  ])

  // Create Panel Users with diverse attributes
  console.log('Creating panel users...')
  const users = await Promise.all([
    // Japanese users
    prisma.panelUser.create({
      data: {
        email: 'yuki.tanaka@example.jp',
        name: 'Yuki Tanaka',
        status: UserStatus.active,
        attributesJson: {
          country: 'JP',
          city: 'Tokyo',
          tag: 'power-user',
          age: 28,
          plan: 'premium',
          occupation: 'software-engineer',
          company_size: '50-200',
          tags: ['beta-tester', 'power-user'],
          signupDate: '2023-01-15',
          lastActive: '2024-11-15'
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'kenji.sato@example.jp',
        name: 'Kenji Sato',
        status: UserStatus.active,
        attributesJson: {
          country: 'JP',
          city: 'Osaka',
          tag: 'regular',
          age: 35,
          plan: 'premium',
          occupation: 'product-manager',
          company_size: '200-1000',
          tags: ['active'],
          signupDate: '2023-03-20',
          lastActive: '2024-11-14'
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'aiko.yamamoto@example.jp',
        name: 'Aiko Yamamoto',
        status: UserStatus.active,
        attributesJson: {
          country: 'JP',
          city: 'Kyoto',
          tag: 'power-user',
          age: 31,
          plan: 'enterprise',
          occupation: 'designer',
          company_size: '1000+',
          tags: ['early-adopter', 'beta-tester'],
          signupDate: '2022-11-10',
          lastActive: '2024-11-16'
        }
      }
    }),

    // US users
    prisma.panelUser.create({
      data: {
        email: 'sarah.johnson@example.com',
        name: 'Sarah Johnson',
        status: UserStatus.active,
        attributesJson: {
          country: 'US',
          city: 'San Francisco',
          tag: 'power-user',
          age: 32,
          plan: 'free',
          occupation: 'startup-founder',
          company_size: '1-10',
          tags: ['power-user', 'early-adopter'],
          signupDate: '2023-06-05',
          lastActive: '2024-11-17'
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'mike.chen@example.com',
        name: 'Mike Chen',
        status: UserStatus.active,
        attributesJson: {
          country: 'US',
          city: 'New York',
          tag: 'regular',
          age: 45,
          plan: 'premium',
          occupation: 'enterprise-admin',
          company_size: '1000+',
          tags: ['regular'],
          signupDate: '2023-02-28',
          lastActive: '2024-11-13'
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'emily.rodriguez@example.com',
        name: 'Emily Rodriguez',
        status: UserStatus.active,
        attributesJson: {
          country: 'US',
          city: 'Austin',
          tag: 'power-user',
          age: 29,
          plan: 'premium',
          occupation: 'data-analyst',
          company_size: '50-200',
          tags: ['power-user', 'beta-tester'],
          signupDate: '2023-04-12',
          lastActive: '2024-11-18'
        }
      }
    }),

    // European users
    prisma.panelUser.create({
      data: {
        email: 'anna.mueller@example.de',
        name: 'Anna Mueller',
        status: UserStatus.active,
        attributesJson: {
          country: 'DE',
          city: 'Berlin',
          tag: 'power-user',
          age: 29,
          plan: 'premium',
          occupation: 'ux-researcher',
          company_size: '200-1000',
          tags: ['beta-tester', 'power-user'],
          signupDate: '2023-01-22',
          lastActive: '2024-11-16'
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'pierre.dubois@example.fr',
        name: 'Pierre Dubois',
        status: UserStatus.active,
        attributesJson: {
          country: 'FR',
          city: 'Paris',
          tag: 'regular',
          age: 38,
          plan: 'free',
          occupation: 'consultant',
          company_size: '10-50',
          tags: ['regular'],
          signupDate: '2023-07-08',
          lastActive: '2024-11-10'
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'lucia.rossi@example.it',
        name: 'Lucia Rossi',
        status: UserStatus.active,
        attributesJson: {
          country: 'IT',
          city: 'Milan',
          tag: 'power-user',
          age: 33,
          plan: 'enterprise',
          occupation: 'cto',
          company_size: '200-1000',
          tags: ['early-adopter', 'power-user'],
          signupDate: '2022-12-01',
          lastActive: '2024-11-17'
        }
      }
    }),

    // Additional diverse users
    prisma.panelUser.create({
      data: {
        email: 'raj.patel@example.in',
        name: 'Raj Patel',
        status: UserStatus.active,
        attributesJson: {
          country: 'IN',
          city: 'Bangalore',
          tag: 'regular',
          age: 27,
          plan: 'free',
          occupation: 'developer',
          company_size: '50-200',
          tags: ['regular'],
          signupDate: '2023-08-15',
          lastActive: '2024-11-15'
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'inactive.user@example.com',
        name: 'Inactive User',
        status: UserStatus.inactive,
        attributesJson: {
          country: 'US',
          city: 'Seattle',
          tag: 'regular',
          age: 42,
          plan: 'free',
          tags: [],
          signupDate: '2022-05-10',
          lastActive: '2023-06-20'
        }
      }
    })
  ])

  console.log(`Created ${users.length} users`)

  // Create user preferences for active users
  console.log('Creating user preferences...')
  const preferences = await Promise.all(
    users.filter(u => u.status === UserStatus.active).slice(0, 8).map((user, idx) =>
      prisma.userPreference.create({
        data: {
          userId: user.id,
          optedIn: true,
          emailNotifications: idx % 3 !== 0,
          smsNotifications: idx % 5 === 0,
          maxSurveysPerMonth: [2, 4, 6][idx % 3],
          preferredLanguage: user.email.includes('.jp') ? 'ja' : user.email.includes('.fr') ? 'fr' : 'en'
        }
      })
    )
  )

  console.log(`Created ${preferences.length} user preferences`)

  // Tag users
  console.log('Tagging users...')
  await Promise.all([
    prisma.userTag.create({ data: { userId: users[0].id, tagId: tags.find(t => t.name === 'power-user')!.id } }),
    prisma.userTag.create({ data: { userId: users[0].id, tagId: tags.find(t => t.name === 'beta-tester')!.id } }),
    prisma.userTag.create({ data: { userId: users[0].id, tagId: tags.find(t => t.name === 'japan')!.id } }),
    prisma.userTag.create({ data: { userId: users[2].id, tagId: tags.find(t => t.name === 'power-user')!.id } }),
    prisma.userTag.create({ data: { userId: users[2].id, tagId: tags.find(t => t.name === 'enterprise')!.id } }),
    prisma.userTag.create({ data: { userId: users[3].id, tagId: tags.find(t => t.name === 'power-user')!.id } }),
    prisma.userTag.create({ data: { userId: users[3].id, tagId: tags.find(t => t.name === 'americas')!.id } }),
    prisma.userTag.create({ data: { userId: users[6].id, tagId: tags.find(t => t.name === 'power-user')!.id } }),
    prisma.userTag.create({ data: { userId: users[6].id, tagId: tags.find(t => t.name === 'europe')!.id } })
  ])

  // Create Campaign Templates
  console.log('Creating campaign templates...')
  const templates = await Promise.all([
    prisma.campaignTemplate.create({
      data: {
        name: 'Product Feedback Survey Template',
        description: 'Standard template for collecting product feedback',
        type: CampaignType.survey,
        category: 'product',
        isPublic: true,
        payloadJson: {
          surveyUrl: 'https://example.com/surveys/{campaignId}',
          questions: [
            { id: 1, text: 'How satisfied are you with our product?', type: 'rating' },
            { id: 2, text: 'What features would you like to see?', type: 'text' },
            { id: 3, text: 'How likely are you to recommend us?', type: 'nps' }
          ],
          estimatedTime: '5 minutes'
        }
      }
    }),
    prisma.campaignTemplate.create({
      data: {
        name: 'User Interview Template',
        description: 'Template for scheduling user interviews',
        type: CampaignType.interview,
        category: 'research',
        isPublic: true,
        payloadJson: {
          duration: '30 minutes',
          incentive: '$50 Amazon gift card',
          meetingUrl: 'https://meet.example.com/{userId}',
          topics: ['Product usage patterns', 'Pain points', 'Feature requests']
        }
      }
    }),
    prisma.campaignTemplate.create({
      data: {
        name: 'NPS Survey Template',
        description: 'Net Promoter Score survey',
        type: CampaignType.survey,
        category: 'metrics',
        isPublic: true,
        payloadJson: {
          surveyUrl: 'https://example.com/nps/{campaignId}',
          questions: [
            { id: 1, text: 'How likely are you to recommend us to a friend or colleague?', type: 'nps', scale: '0-10' },
            { id: 2, text: 'What is the primary reason for your score?', type: 'text' }
          ]
        }
      }
    })
  ])

  console.log(`Created ${templates.length} campaign templates`)

  // Create Cohorts
  console.log('Creating cohorts...')
  const cohorts = await Promise.all([
    prisma.cohort.create({
      data: {
        name: 'JP Power Users',
        description: 'Power users from Japan for beta feature testing',
        ruleJson: { country: 'JP', tag: 'power-user' },
        isActive: true
      }
    }),
    prisma.cohort.create({
      data: {
        name: 'Premium Plan Users',
        description: 'All users on premium plan for upgrade survey',
        ruleJson: { plan: 'premium' },
        isActive: true
      }
    }),
    prisma.cohort.create({
      data: {
        name: 'Beta Testers',
        description: 'Users who are beta testers (using $contains)',
        ruleJson: { tags: { $contains: 'beta-tester' } },
        isActive: true
      }
    }),
    prisma.cohort.create({
      data: {
        name: 'Young Professionals (25-35)',
        description: 'Users aged between 25 and 35 (using numeric operators)',
        ruleJson: { age: { $gte: 25, $lte: 35 } },
        isActive: true
      }
    }),
    prisma.cohort.create({
      data: {
        name: 'Enterprise Customers',
        description: 'Large company users for enterprise feedback',
        ruleJson: { plan: 'enterprise' },
        isActive: true
      }
    }),
    prisma.cohort.create({
      data: {
        name: 'US Early Adopters',
        description: 'Early adopters in the US market',
        ruleJson: { country: 'US', tags: { $contains: 'early-adopter' } },
        isActive: true
      }
    }),
    prisma.cohort.create({
      data: {
        name: 'European Market Segment',
        description: 'All European users for market research',
        ruleJson: { country: { $in: ['DE', 'FR', 'IT', 'UK'] } },
        isActive: true
      }
    }),
    prisma.cohort.create({
      data: {
        name: 'Inactive Testing Cohort',
        description: 'Testing cohort that is inactive',
        ruleJson: { plan: 'free', age: { $gt: 40 } },
        isActive: false
      }
    })
  ])

  console.log(`Created ${cohorts.length} cohorts`)

  // Tag cohorts
  await Promise.all([
    prisma.cohortTag.create({ data: { cohortId: cohorts[0].id, tagId: tags.find(t => t.name === 'japan')!.id } }),
    prisma.cohortTag.create({ data: { cohortId: cohorts[0].id, tagId: tags.find(t => t.name === 'product-feedback')!.id } }),
    prisma.cohortTag.create({ data: { cohortId: cohorts[4].id, tagId: tags.find(t => t.name === 'enterprise')!.id } }),
    prisma.cohortTag.create({ data: { cohortId: cohorts[5].id, tagId: tags.find(t => t.name === 'americas')!.id } }),
    prisma.cohortTag.create({ data: { cohortId: cohorts[6].id, tagId: tags.find(t => t.name === 'europe')!.id } }),
    prisma.cohortTag.create({ data: { cohortId: cohorts[6].id, tagId: tags.find(t => t.name === 'market-research')!.id } })
  ])

  // Materialize cohort members
  console.log('Materializing cohort members...')

  // JP Power Users: Yuki, Aiko
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: cohorts[0].id, userId: users[0].id },
      { cohortId: cohorts[0].id, userId: users[2].id }
    ]
  })

  // Premium Users: Yuki, Kenji, Mike, Anna, Emily
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: cohorts[1].id, userId: users[0].id },
      { cohortId: cohorts[1].id, userId: users[1].id },
      { cohortId: cohorts[1].id, userId: users[4].id },
      { cohortId: cohorts[1].id, userId: users[5].id },
      { cohortId: cohorts[1].id, userId: users[6].id }
    ]
  })

  // Beta Testers: Yuki, Aiko, Anna, Emily
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: cohorts[2].id, userId: users[0].id },
      { cohortId: cohorts[2].id, userId: users[2].id },
      { cohortId: cohorts[2].id, userId: users[5].id },
      { cohortId: cohorts[2].id, userId: users[6].id }
    ]
  })

  // Young Professionals (25-35): Many users
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: cohorts[3].id, userId: users[0].id },
      { cohortId: cohorts[3].id, userId: users[2].id },
      { cohortId: cohorts[3].id, userId: users[3].id },
      { cohortId: cohorts[3].id, userId: users[5].id },
      { cohortId: cohorts[3].id, userId: users[6].id },
      { cohortId: cohorts[3].id, userId: users[8].id },
      { cohortId: cohorts[3].id, userId: users[9].id }
    ]
  })

  // Enterprise Customers: Aiko, Lucia
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: cohorts[4].id, userId: users[2].id },
      { cohortId: cohorts[4].id, userId: users[8].id }
    ]
  })

  // US Early Adopters: Sarah
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: cohorts[5].id, userId: users[3].id }
    ]
  })

  // European Market: Anna, Pierre, Lucia
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: cohorts[6].id, userId: users[6].id },
      { cohortId: cohorts[6].id, userId: users[7].id },
      { cohortId: cohorts[6].id, userId: users[8].id }
    ]
  })

  console.log('Cohort members materialized')

  // Create cohort analytics
  await Promise.all(
    cohorts.slice(0, 7).map((cohort, idx) =>
      prisma.cohortAnalytics.create({
        data: {
          cohortId: cohort.id,
          memberCount: [2, 5, 4, 7, 2, 1, 3][idx],
          activeMembers: [2, 5, 4, 7, 2, 1, 3][idx],
          avgResponseRate: [0.85, 0.72, 0.90, 0.65, 0.95, 0.80, 0.70][idx],
          lastMaterializedAt: new Date()
        }
      })
    )
  )

  // Create Feedback Campaigns
  console.log('Creating feedback campaigns...')
  const campaigns = await Promise.all([
    prisma.feedbackCampaign.create({
      data: {
        cohortId: cohorts[2].id,
        templateId: templates[0].id,
        name: 'Beta Feature Feedback Survey',
        type: CampaignType.survey,
        status: CampaignStatus.completed,
        payloadJson: {
          surveyUrl: 'https://example.com/surveys/beta-feedback-2024',
          description: 'Tell us about your experience with our new beta features',
          estimatedTime: '7 minutes'
        },
        launchedAt: new Date('2024-10-15'),
        closedAt: new Date('2024-11-01')
      }
    }),
    prisma.feedbackCampaign.create({
      data: {
        cohortId: cohorts[1].id,
        templateId: templates[1].id,
        name: 'Premium User Experience Interview',
        type: CampaignType.interview,
        status: CampaignStatus.active,
        payloadJson: {
          meetingUrl: 'https://meet.example.com/premium-interview',
          duration: '30 minutes',
          incentive: '$50 Amazon gift card',
          topics: ['Premium features usage', 'Value proposition', 'Feature requests']
        },
        launchedAt: new Date('2024-11-01')
      }
    }),
    prisma.feedbackCampaign.create({
      data: {
        cohortId: cohorts[0].id,
        name: 'Japan Market Research Survey',
        type: CampaignType.survey,
        status: CampaignStatus.completed,
        payloadJson: {
          surveyUrl: 'https://example.com/surveys/jp-market-2024',
          language: 'ja',
          description: '日本市場における製品改善のためのアンケート'
        },
        launchedAt: new Date('2024-09-01'),
        closedAt: new Date('2024-09-15')
      }
    }),
    prisma.feedbackCampaign.create({
      data: {
        cohortId: cohorts[4].id,
        templateId: templates[0].id,
        name: 'Enterprise Customer Satisfaction',
        type: CampaignType.survey,
        status: CampaignStatus.active,
        payloadJson: {
          surveyUrl: 'https://example.com/surveys/enterprise-satisfaction',
          description: 'Help us improve our enterprise offering'
        },
        launchedAt: new Date('2024-11-10')
      }
    }),
    prisma.feedbackCampaign.create({
      data: {
        cohortId: cohorts[3].id,
        templateId: templates[2].id,
        name: 'Q4 2024 NPS Survey',
        type: CampaignType.survey,
        status: CampaignStatus.scheduled,
        payloadJson: {
          surveyUrl: 'https://example.com/nps/q4-2024'
        },
        scheduledFor: new Date('2024-12-01')
      }
    }),
    prisma.feedbackCampaign.create({
      data: {
        cohortId: cohorts[6].id,
        name: 'European Market Expansion Research',
        type: CampaignType.interview,
        status: CampaignStatus.draft,
        payloadJson: {
          meetingUrl: 'https://meet.example.com/eu-research',
          duration: '45 minutes',
          incentive: '€50 voucher'
        }
      }
    })
  ])

  console.log(`Created ${campaigns.length} campaigns`)

  // Tag campaigns
  await Promise.all([
    prisma.campaignTag.create({ data: { campaignId: campaigns[0].id, tagId: tags.find(t => t.name === 'product-feedback')!.id } }),
    prisma.campaignTag.create({ data: { campaignId: campaigns[0].id, tagId: tags.find(t => t.name === 'beta-tester')!.id } }),
    prisma.campaignTag.create({ data: { campaignId: campaigns[1].id, tagId: tags.find(t => t.name === 'ux-research')!.id } }),
    prisma.campaignTag.create({ data: { campaignId: campaigns[2].id, tagId: tags.find(t => t.name === 'market-research')!.id } }),
    prisma.campaignTag.create({ data: { campaignId: campaigns[2].id, tagId: tags.find(t => t.name === 'japan')!.id } }),
    prisma.campaignTag.create({ data: { campaignId: campaigns[5].id, tagId: tags.find(t => t.name === 'market-research')!.id } }),
    prisma.campaignTag.create({ data: { campaignId: campaigns[5].id, tagId: tags.find(t => t.name === 'europe')!.id } })
  ])

  // Create Feedback Responses
  console.log('Creating feedback responses...')
  const responses = await prisma.feedbackResponse.createMany({
    data: [
      // Beta survey responses
      {
        campaignId: campaigns[0].id,
        userId: users[0].id,
        responseJson: {
          rating: 5,
          comment: 'The beta features are amazing! Very intuitive and fast.',
          features_liked: ['new-dashboard', 'real-time-sync', 'mobile-app'],
          would_recommend: true,
          nps_score: 9
        },
        sentimentScore: 0.9,
        completionRate: 1.0
      },
      {
        campaignId: campaigns[0].id,
        userId: users[2].id,
        responseJson: {
          rating: 4,
          comment: 'Great features but needs better documentation and onboarding.',
          features_liked: ['new-dashboard', 'api-improvements'],
          features_disliked: ['complex-settings'],
          would_recommend: true,
          nps_score: 8
        },
        sentimentScore: 0.6,
        completionRate: 1.0
      },
      {
        campaignId: campaigns[0].id,
        userId: users[5].id,
        responseJson: {
          rating: 5,
          comment: 'Excellent update! The new analytics dashboard is exactly what we needed.',
          features_liked: ['analytics', 'reporting', 'exports'],
          would_recommend: true,
          nps_score: 10
        },
        sentimentScore: 0.95,
        completionRate: 1.0
      },

      // Premium interview responses
      {
        campaignId: campaigns[1].id,
        userId: users[1].id,
        responseJson: {
          attended: true,
          satisfaction_score: 9,
          main_feedback: 'Premium plan offers great value. Would like more integrations with project management tools.',
          feature_requests: ['Jira integration', 'Slack notifications', 'Custom webhooks'],
          interview_date: '2024-11-05',
          duration_minutes: 32
        },
        sentimentScore: 0.85,
        completionRate: 1.0
      },
      {
        campaignId: campaigns[1].id,
        userId: users[4].id,
        responseJson: {
          attended: true,
          satisfaction_score: 8,
          main_feedback: 'Very satisfied with the service. Customer support is excellent. Pricing is fair.',
          feature_requests: ['API rate limit increase', 'Priority support', 'Advanced analytics'],
          interview_date: '2024-11-08',
          duration_minutes: 28
        },
        sentimentScore: 0.75,
        completionRate: 1.0
      },

      // Japan market research
      {
        campaignId: campaigns[2].id,
        userId: users[0].id,
        responseJson: {
          market_fit: 'excellent',
          pricing_perception: 'fair',
          feature_requests: ['Japanese language support', 'local payment methods', 'region-specific compliance'],
          cultural_fit: 'good',
          nps_score: 9,
          additional_comments: 'Product works well in Japanese market. Need better localization.'
        },
        sentimentScore: 0.8,
        completionRate: 1.0
      },
      {
        campaignId: campaigns[2].id,
        userId: users[2].id,
        responseJson: {
          market_fit: 'very good',
          pricing_perception: 'slightly expensive',
          feature_requests: ['Local server options', 'Japanese customer support'],
          cultural_fit: 'excellent',
          nps_score: 8
        },
        sentimentScore: 0.7,
        completionRate: 0.9
      },

      // Enterprise satisfaction
      {
        campaignId: campaigns[3].id,
        userId: users[2].id,
        responseJson: {
          overall_satisfaction: 9,
          ease_of_use: 8,
          feature_completeness: 9,
          support_quality: 10,
          value_for_money: 8,
          comments: 'Excellent enterprise product. Support team is very responsive.',
          improvement_areas: ['Bulk operations', 'Advanced permissions']
        },
        sentimentScore: 0.9,
        completionRate: 1.0
      }
    ]
  })

  console.log(`Created ${responses.count} responses`)

  // Create campaign analytics
  await Promise.all([
    prisma.campaignAnalytics.create({
      data: {
        campaignId: campaigns[0].id,
        targetCount: 4,
        responseCount: 3,
        responseRate: 0.75,
        avgSentiment: 0.82,
        avgCompletionRate: 1.0
      }
    }),
    prisma.campaignAnalytics.create({
      data: {
        campaignId: campaigns[1].id,
        targetCount: 5,
        responseCount: 2,
        responseRate: 0.4,
        avgSentiment: 0.8,
        avgCompletionRate: 1.0
      }
    }),
    prisma.campaignAnalytics.create({
      data: {
        campaignId: campaigns[2].id,
        targetCount: 2,
        responseCount: 2,
        responseRate: 1.0,
        avgSentiment: 0.75,
        avgCompletionRate: 0.95
      }
    }),
    prisma.campaignAnalytics.create({
      data: {
        campaignId: campaigns[3].id,
        targetCount: 2,
        responseCount: 1,
        responseRate: 0.5,
        avgSentiment: 0.9,
        avgCompletionRate: 1.0
      }
    })
  ])

  // Create audit logs
  console.log('Creating audit logs...')
  await prisma.auditLog.createMany({
    data: [
      {
        userId: users[0].id,
        entityType: 'Cohort',
        entityId: cohorts[0].id,
        action: 'created',
        changes: { name: 'JP Power Users' },
        ipAddress: '203.0.113.1'
      },
      {
        userId: users[0].id,
        entityType: 'Campaign',
        entityId: campaigns[0].id,
        action: 'created',
        changes: { name: 'Beta Feature Feedback Survey' },
        ipAddress: '203.0.113.1'
      },
      {
        userId: users[3].id,
        entityType: 'Response',
        entityId: 'resp-1',
        action: 'created',
        ipAddress: '198.51.100.42'
      },
      {
        entityType: 'Cohort',
        entityId: cohorts[2].id,
        action: 'updated',
        changes: { memberCount: 4 }
      }
    ]
  })

  console.log('Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- ${users.length} Panel Users`)
  console.log(`- ${tags.length} Tags`)
  console.log(`- ${templates.length} Campaign Templates`)
  console.log(`- ${cohorts.length} Cohorts`)
  console.log(`- ${campaigns.length} Campaigns (various statuses)`)
  console.log(`- ${responses.count} Responses`)
  console.log('- Analytics, Preferences, and Audit Logs created')
  console.log('\n✅ Database ready for exploration!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
