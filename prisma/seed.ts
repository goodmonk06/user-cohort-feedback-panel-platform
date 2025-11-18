import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.feedbackResponse.deleteMany()
  await prisma.feedbackCampaign.deleteMany()
  await prisma.cohortMember.deleteMany()
  await prisma.cohort.deleteMany()
  await prisma.panelUser.deleteMany()

  // Create Panel Users with diverse attributes
  console.log('Creating panel users...')
  const users = await Promise.all([
    prisma.panelUser.create({
      data: {
        email: 'yuki.tanaka@example.jp',
        name: 'Yuki Tanaka',
        attributesJson: {
          country: 'JP',
          tag: 'power-user',
          age: 28,
          plan: 'premium',
          tags: ['beta-tester', 'power-user']
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'kenji.sato@example.jp',
        name: 'Kenji Sato',
        attributesJson: {
          country: 'JP',
          tag: 'regular',
          age: 35,
          plan: 'premium',
          tags: ['active']
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'sarah.johnson@example.com',
        name: 'Sarah Johnson',
        attributesJson: {
          country: 'US',
          tag: 'power-user',
          age: 32,
          plan: 'free',
          tags: ['power-user', 'early-adopter']
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'mike.chen@example.com',
        name: 'Mike Chen',
        attributesJson: {
          country: 'US',
          tag: 'regular',
          age: 45,
          plan: 'premium',
          tags: ['regular']
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'anna.mueller@example.de',
        name: 'Anna Mueller',
        attributesJson: {
          country: 'DE',
          tag: 'power-user',
          age: 29,
          plan: 'premium',
          tags: ['beta-tester', 'power-user']
        }
      }
    }),
    prisma.panelUser.create({
      data: {
        email: 'pierre.dubois@example.fr',
        name: 'Pierre Dubois',
        attributesJson: {
          country: 'FR',
          tag: 'regular',
          age: 38,
          plan: 'free',
          tags: ['regular']
        }
      }
    })
  ])

  console.log(`Created ${users.length} users`)

  // Create Cohorts with different rules
  console.log('Creating cohorts...')
  const jpPowerUsers = await prisma.cohort.create({
    data: {
      name: 'JP Power Users',
      description: 'Power users from Japan for beta feature testing',
      ruleJson: {
        country: 'JP',
        tag: 'power-user'
      }
    }
  })

  const premiumUsers = await prisma.cohort.create({
    data: {
      name: 'Premium Plan Users',
      description: 'All users on premium plan for upgrade survey',
      ruleJson: {
        plan: 'premium'
      }
    }
  })

  const betaTesters = await prisma.cohort.create({
    data: {
      name: 'Beta Testers',
      description: 'Users who are beta testers (using $contains)',
      ruleJson: {
        tags: { $contains: 'beta-tester' }
      }
    }
  })

  const youngAdults = await prisma.cohort.create({
    data: {
      name: 'Young Adults (25-35)',
      description: 'Users aged between 25 and 35 (using numeric operators)',
      ruleJson: {
        age: { $gte: 25, $lte: 35 }
      }
    }
  })

  console.log('Created 4 cohorts')

  // Materialize cohort members based on rules
  console.log('Materializing cohort members...')

  // JP Power Users: Yuki Tanaka
  await prisma.cohortMember.create({
    data: {
      cohortId: jpPowerUsers.id,
      userId: users[0].id // Yuki
    }
  })

  // Premium Users: Yuki, Kenji, Mike, Anna
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: premiumUsers.id, userId: users[0].id }, // Yuki
      { cohortId: premiumUsers.id, userId: users[1].id }, // Kenji
      { cohortId: premiumUsers.id, userId: users[3].id }, // Mike
      { cohortId: premiumUsers.id, userId: users[4].id }  // Anna
    ]
  })

  // Beta Testers: Yuki, Anna
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: betaTesters.id, userId: users[0].id }, // Yuki
      { cohortId: betaTesters.id, userId: users[4].id }  // Anna
    ]
  })

  // Young Adults (25-35): Yuki (28), Sarah (32), Anna (29)
  await prisma.cohortMember.createMany({
    data: [
      { cohortId: youngAdults.id, userId: users[0].id }, // Yuki
      { cohortId: youngAdults.id, userId: users[2].id }, // Sarah
      { cohortId: youngAdults.id, userId: users[4].id }  // Anna
    ]
  })

  console.log('Materialized cohort members')

  // Create Feedback Campaigns
  console.log('Creating campaigns...')
  const betaSurvey = await prisma.feedbackCampaign.create({
    data: {
      cohortId: betaTesters.id,
      name: 'Beta Feature Feedback Survey',
      type: 'survey',
      payloadJson: {
        surveyUrl: 'https://example.com/surveys/beta-feedback-2024',
        description: 'Tell us about your experience with our new beta features'
      }
    }
  })

  const premiumInterview = await prisma.feedbackCampaign.create({
    data: {
      cohortId: premiumUsers.id,
      name: 'Premium User Experience Interview',
      type: 'interview',
      payloadJson: {
        meetingUrl: 'https://meet.example.com/premium-interview',
        duration: '30 minutes',
        incentive: '$50 Amazon gift card'
      }
    }
  })

  const jpSurvey = await prisma.feedbackCampaign.create({
    data: {
      cohortId: jpPowerUsers.id,
      name: 'Japan Market Research Survey',
      type: 'survey',
      payloadJson: {
        surveyUrl: 'https://example.com/surveys/jp-market-2024',
        language: 'ja',
        description: '日本市場における製品改善のためのアンケート'
      }
    }
  })

  console.log('Created 3 campaigns')

  // Create Feedback Responses
  console.log('Creating responses...')
  await prisma.feedbackResponse.createMany({
    data: [
      {
        campaignId: betaSurvey.id,
        userId: users[0].id, // Yuki
        responseJson: {
          rating: 5,
          comment: 'The beta features are amazing! Very intuitive and fast.',
          features_liked: ['new-dashboard', 'real-time-sync'],
          would_recommend: true
        }
      },
      {
        campaignId: betaSurvey.id,
        userId: users[4].id, // Anna
        responseJson: {
          rating: 4,
          comment: 'Great features but needs better documentation.',
          features_liked: ['new-dashboard'],
          would_recommend: true
        }
      },
      {
        campaignId: premiumInterview.id,
        userId: users[1].id, // Kenji
        responseJson: {
          attended: true,
          satisfaction_score: 9,
          main_feedback: 'Premium plan offers great value, would like more integrations',
          interview_date: '2024-01-15'
        }
      },
      {
        campaignId: premiumInterview.id,
        userId: users[3].id, // Mike
        responseJson: {
          attended: true,
          satisfaction_score: 8,
          main_feedback: 'Very satisfied with the service, customer support is excellent',
          interview_date: '2024-01-16'
        }
      },
      {
        campaignId: jpSurvey.id,
        userId: users[0].id, // Yuki
        responseJson: {
          market_fit: 'excellent',
          pricing_perception: 'fair',
          feature_requests: ['Japanese language support', 'local payment methods'],
          nps_score: 9
        }
      }
    ]
  })

  console.log('Created 5 responses')

  console.log('Seed completed successfully!')
  console.log('\nSummary:')
  console.log('- 6 Panel Users')
  console.log('- 4 Cohorts (JP Power Users, Premium Users, Beta Testers, Young Adults)')
  console.log('- 3 Campaigns (2 surveys, 1 interview)')
  console.log('- 5 Responses')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
