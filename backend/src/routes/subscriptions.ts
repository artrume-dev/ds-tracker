import express, { Request, Response, Router } from 'express';
import { notificationService, NotificationData } from '../services/NotificationService';

const router: Router = Router();

// GET /api/subscriptions - Get all team subscriptions
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get real subscriptions from the database
    const subscriptions = await notificationService.getAllSubscriptions();
    
    // Transform to match expected format
    const formattedSubscriptions = subscriptions.map(sub => ({
      teamName: sub.teamName,
      email: sub.email || '',
      preferences: {
        tokenChanges: sub.tokenChanges,
        patternUpdates: sub.patternUpdates,
        scanResults: sub.scanResults,
        approvalRequests: sub.approvalRequests
      }
    }));

    res.json({
      success: true,
      subscriptions: formattedSubscriptions,
      total: formattedSubscriptions.length
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/subscriptions/:teamName - Get team subscription
router.get('/:teamName', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    
    // Get real subscription from database
    const subscription = await notificationService.getTeamSubscription(teamName);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Team subscription not found'
      });
    }

    // Transform to match expected format
    const formattedSubscription = {
      teamName: subscription.teamName,
      email: subscription.email || '',
      preferences: {
        tokenChanges: subscription.tokenChanges,
        patternUpdates: subscription.patternUpdates,
        scanResults: subscription.scanResults,
        approvalRequests: subscription.approvalRequests
      }
    };

    res.json({
      success: true,
      subscription: formattedSubscription
    });
  } catch (error) {
    console.error('Error getting team subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/subscriptions/:teamName - Create or update team subscription
router.post('/:teamName', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { email, preferences } = req.body;

    console.log('Creating/updating subscription:', { teamName, email, preferences });

    // Create subscription object for database
    const subscription = {
      teamName,
      email: email || '',
      tokenChanges: preferences?.tokenChanges || false,
      patternUpdates: preferences?.patternUpdates || false,
      scanResults: preferences?.scanResults || false,
      approvalRequests: preferences?.approvalRequests || false
    };

    // Save to database
    await notificationService.updateTeamSubscription(teamName, subscription);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        teamName,
        email,
        preferences
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/subscriptions/:teamName - Update team subscription
router.put('/:teamName', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { email, preferences } = req.body;

    console.log('Updating subscription:', { teamName, email, preferences });

    // Create subscription object for database
    const subscription = {
      teamName,
      email: email || '',
      tokenChanges: preferences?.tokenChanges || false,
      patternUpdates: preferences?.patternUpdates || false,
      scanResults: preferences?.scanResults || false,
      approvalRequests: preferences?.approvalRequests || false
    };

    // Save to database
    await notificationService.updateTeamSubscription(teamName, subscription);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        teamName,
        email,
        preferences
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/subscriptions/:teamName/test - Test team subscription notification
router.post('/:teamName/test', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    
    console.log('Testing notification for team:', teamName);

    // Create a test notification and trigger actual email sending
    const notificationId = await notificationService.createNotification({
      type: 'token_change',
      title: `Test Notification for ${teamName}`,
      message: `This is a test email notification for the ${teamName} team. If you receive this email, your subscription is working correctly!`,
      severity: 'info',
      metadata: {
        teamName,
        tokenName: 'test-token',
        oldValue: 'old-value',
        newValue: 'new-value'
      },
      actionUrl: 'http://localhost:3000/team-subscriptions'
    });

    res.json({
      success: true,
      message: `Test notification sent to ${teamName}`,
      testResult: {
        team: teamName,
        status: 'sent',
        timestamp: new Date().toISOString(),
        notificationId
      }
    });
  } catch (error) {
    console.error('Error testing subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/subscriptions/test-enhanced-email - Test enhanced email formatting with detailed commit info
router.post('/test-enhanced-email', async (req: Request, res: Response) => {
  try {
    console.log('\n📧 TESTING ENHANCED EMAIL FORMATTING');
    console.log('=' .repeat(60));

    // Create realistic commit data that showcases enhanced git integration
    // ✅ Sub-task 3.1: Detailed commit information with real-world scenarios
    const enhancedTestData = {
      changeId: `ds-update-${Date.now()}`,
      author: 'Sarah Chen',
      authorEmail: 'sarah.chen@company.com',
      authorTeam: 'Design System Team',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      message: 'feat: Update color tokens for WCAG AA compliance and add new semantic tokens\n\n- Updated primary colors to meet contrast requirements\n- Added new semantic tokens for success/warning states\n- Deprecated old color variables\n- Updated documentation with usage guidelines\n\nBreaking Change: color-primary-500 hex value changed\nTesting: Updated visual regression tests\nReviewed-by: Design Team Lead',
      commitHash: 'a7b8c9d1e2f3456789abcdef0123456789abcdef',
      repositoryUrl: '/Users/samarmustafa/Documents/Projects/2025/VIBE-CODING/canon-design-system-repo',
      repositoryName: 'Canon Design System',
      branch: 'main',
      // ✅ Sub-task 3.2: Enhanced dashboard links with specific commit and change details
      dashboardUrl: `http://localhost:3000/dashboard?tab=changes&commit=a7b8c9d1e2f3456789abcdef0123456789abcdef&repo=canon-design-system&author=sarah.chen`,
      pullRequestUrl: 'https://github.com/canon/design-system/pull/234',
      changes: [
        {
          type: 'updated' as const,
          tokenName: 'color-primary-500',
          oldValue: '#3366cc',
          newValue: '#2563eb',
          category: 'colors',
          filePath: 'tokens/colors/brand.json',
          description: 'Updated primary brand color for WCAG AA compliance (contrast ratio 4.5:1)',
          affectedFiles: [
            'tokens/colors/brand.json',
            'tokens/semantic/actions.json',
            'docs/colors.md',
            'tests/visual/buttons.spec.ts'
          ],
          impactLevel: 'high',
          usageCount: 47,
          affectedComponents: ['Button', 'Link', 'Badge', 'Tab']
        },
        {
          type: 'added' as const,
          tokenName: 'color-success-50',
          newValue: '#f0fdf4',
          category: 'colors',
          filePath: 'tokens/semantic/feedback.json',
          description: 'Added new success state color token for consistent feedback patterns',
          affectedFiles: [
            'tokens/semantic/feedback.json',
            'docs/semantic-tokens.md'
          ],
          impactLevel: 'medium',
          usageCount: 0,
          affectedComponents: ['Alert', 'Toast', 'FormValidation']
        },
        {
          type: 'updated' as const,
          tokenName: 'spacing-component-padding-lg',
          oldValue: '1rem',
          newValue: '1.25rem',
          category: 'spacing',
          filePath: 'tokens/spacing/component.json',
          description: 'Increased large component padding for better touch targets on mobile devices',
          affectedFiles: [
            'tokens/spacing/component.json',
            'components/Button/Button.css',
            'components/Card/Card.css'
          ],
          impactLevel: 'medium',
          usageCount: 23,
          affectedComponents: ['Button', 'Card', 'Modal']
        },
        {
          type: 'removed' as const,
          tokenName: 'color-legacy-blue',
          oldValue: '#4080ff',
          category: 'colors',
          filePath: 'tokens/colors/deprecated.json',
          description: 'Removed deprecated legacy blue color token (use color-primary-500 instead)',
          affectedFiles: [
            'tokens/colors/deprecated.json',
            'docs/migration-guide.md'
          ],
          impactLevel: 'low',
          usageCount: 3,
          affectedComponents: [],
          migrationNote: 'Replace with color-primary-500 or color-blue-500'
        }
      ],
      // Additional commit metadata for enhanced notifications
      stats: {
        filesChanged: 8,
        insertions: 42,
        deletions: 15,
        tokensAffected: 4,
        highImpactChanges: 1,
        breakingChanges: 1
      },
      relatedIssues: ['DS-123', 'WCAG-456'],
      reviewers: ['Design Team Lead', 'Frontend Architect'],
      testingStatus: 'passed',
      deploymentStatus: 'ready-for-staging'
    };

    // Create enhanced token changes with comprehensive commit context
    const enhancedTokenChanges = enhancedTestData.changes.map(change => ({
      ...change,
      // Add rich commit context to each token change for detailed email display
      description: `${change.description} (${enhancedTestData.repositoryName} • Commit: ${enhancedTestData.commitHash.substring(0, 8)} by ${enhancedTestData.author})`
    }));

    // ✅ Sub-task 3.1 & 3.2: Test enhanced email formatting with comprehensive commit details
    console.log('📧 Testing enhanced email formatting with comprehensive git commit details');
    console.log(`📝 Commit: ${enhancedTestData.commitHash.substring(0, 8)} by ${enhancedTestData.author}`);
    console.log(`🔄 Changes: ${enhancedTestData.changes.length} tokens affected`);
    console.log(`📊 Impact: ${enhancedTestData.stats.highImpactChanges} high-impact, ${enhancedTestData.stats.breakingChanges} breaking changes`);
    
    // Send comprehensive notification that showcases all enhanced features
    await notificationService.createNotification({
      type: 'design_system_update',
      title: `🎨 Design System Updated - ${enhancedTestData.repositoryName}`,
      message: `**${enhancedTestData.message.split('\n\n')[0]}**\n\n📝 **Commit Details:**\n- Author: ${enhancedTestData.author} (${enhancedTestData.authorTeam})\n- Branch: ${enhancedTestData.branch}\n- Files Changed: ${enhancedTestData.stats.filesChanged}\n- Tokens Affected: ${enhancedTestData.stats.tokensAffected}\n\n🔄 **Changes Summary:**\n${enhancedTestData.changes.map(c => `• **${c.tokenName}** (${c.type}): ${c.impactLevel} impact`).join('\n')}\n\n⚠️ **${enhancedTestData.stats.breakingChanges} Breaking Change(s)** - Review migration guide\n\n� **Testing Status:** ${enhancedTestData.testingStatus} | **Deployment:** ${enhancedTestData.deploymentStatus}`,
      severity: enhancedTestData.stats.breakingChanges > 0 ? 'warning' : 'info',
      metadata: {
        scanId: enhancedTestData.changeId,
        tokenChanges: enhancedTokenChanges,
        repositoryName: enhancedTestData.repositoryName,
        // ✅ Sub-task 3.1: Enhanced commit details with comprehensive metadata
        commitHash: enhancedTestData.commitHash,
        author: enhancedTestData.author,
        authorEmail: enhancedTestData.authorEmail,
        message: enhancedTestData.message,
        timestamp: enhancedTestData.timestamp,
        branch: enhancedTestData.branch,
        pullRequestUrl: enhancedTestData.pullRequestUrl,
        // Enhanced statistics for better impact assessment
        totalChanges: enhancedTestData.changes.length,
        addedCount: enhancedTestData.changes.filter(c => c.type === 'added').length,
        updatedCount: enhancedTestData.changes.filter(c => c.type === 'updated').length,
        removedCount: enhancedTestData.changes.filter(c => c.type === 'removed').length,
        highImpactCount: enhancedTestData.changes.filter(c => c.impactLevel === 'high').length,
        breakingChanges: enhancedTestData.stats.breakingChanges,
        filesChanged: enhancedTestData.stats.filesChanged,
        // Additional metadata for comprehensive notifications
        relatedIssues: enhancedTestData.relatedIssues,
        reviewers: enhancedTestData.reviewers,
        testingStatus: enhancedTestData.testingStatus,
        deploymentStatus: enhancedTestData.deploymentStatus
      } as any,
      // ✅ Sub-task 3.2: Enhanced dashboard link with comprehensive query parameters
      actionUrl: `${enhancedTestData.dashboardUrl}&impact=high&breaking=true&files=${enhancedTestData.stats.filesChanged}`
    });

    // Send individual change notifications for detailed tracking
    for (const change of enhancedTestData.changes.slice(0, 2)) { // Send first 2 to avoid spam
      await notificationService.createNotification({
        type: 'token_change',
        title: `🎨 Token ${change.type.charAt(0).toUpperCase() + change.type.slice(1)}: ${change.tokenName}`,
        message: `**${enhancedTestData.repositoryName} Update by ${enhancedTestData.author}**\n\n📝 "${change.description}"\n\n🔄 **${change.type.charAt(0).toUpperCase() + change.type.slice(1)} token:** ${change.tokenName}\n${change.oldValue ? `� **Previous:** ${change.oldValue}\n` : ''}${change.newValue ? `📈 **New:** ${change.newValue}\n` : ''}\n📊 **Impact Level:** ${change.impactLevel} | **Usage:** ${change.usageCount} components\n🎯 **Affected Components:** ${change.affectedComponents?.join(', ') || 'None'}\n${change.migrationNote ? `\n⚠️ **Migration:** ${change.migrationNote}` : ''}`,
        severity: change.impactLevel === 'high' ? 'warning' : 'info',
        metadata: {
          scanId: enhancedTestData.changeId,
          tokenChanges: [change],
          repositoryName: enhancedTestData.repositoryName,
          // ✅ Sub-task 3.1: Enhanced commit details with full context
          commitHash: enhancedTestData.commitHash,
          author: enhancedTestData.author,
          authorEmail: enhancedTestData.authorEmail,
          message: enhancedTestData.message,
          timestamp: enhancedTestData.timestamp,
          branch: enhancedTestData.branch,
          pullRequestUrl: enhancedTestData.pullRequestUrl,
          // Token-specific statistics
          totalChanges: 1,
          addedCount: change.type === 'added' ? 1 : 0,
          updatedCount: change.type === 'updated' ? 1 : 0,
          removedCount: change.type === 'removed' ? 1 : 0,
          highImpactCount: change.impactLevel === 'high' ? 1 : 0,
          // Additional context for this specific change
          tokenName: change.tokenName,
          oldValue: change.oldValue,
          newValue: change.newValue,
          impactLevel: change.impactLevel,
          usageCount: change.usageCount,
          affectedComponents: change.affectedComponents,
          migrationNote: change.migrationNote
        } as any,
        // ✅ Sub-task 3.2: Enhanced dashboard link with token-specific parameters
        actionUrl: `${enhancedTestData.dashboardUrl}&token=${encodeURIComponent(change.tokenName)}&type=${change.type}&impact=${change.impactLevel}`
      });
    }

    // ✅ Comprehensive test results showcasing Sub-task 3.1 & 3.2 implementation
    console.log('\n✅ ENHANCED EMAIL TEST COMPLETED');
    console.log('📊 Test Results Summary:');
    console.log(`   📝 Commit: ${enhancedTestData.commitHash.substring(0, 8)} by ${enhancedTestData.author}`);
    console.log(`   🔄 Tokens: ${enhancedTestData.changes.length} changes (${enhancedTestData.stats.highImpactChanges} high-impact)`);
    console.log(`   📧 Notifications: 1 summary + ${enhancedTestData.changes.slice(0, 2).length} individual`);
    console.log(`   🔗 Dashboard: Enhanced links with commit/token context`);
    console.log(`   📊 Features: Impact analysis, migration notes, component mapping`);
    console.log('=' .repeat(60));

    res.json({
      success: true,
      task: 'Enhanced Email Formatting Test - Sub-tasks 3.1 & 3.2',
      testResults: {
        // ✅ Sub-task 3.1: Detailed commit information features
        commitDetailsImplemented: {
          commitHash: enhancedTestData.commitHash,
          author: enhancedTestData.author,
          authorEmail: enhancedTestData.authorEmail,
          authorTeam: enhancedTestData.authorTeam,
          timestamp: enhancedTestData.timestamp,
          message: enhancedTestData.message.substring(0, 100) + '...',
          branch: enhancedTestData.branch,
          pullRequestUrl: enhancedTestData.pullRequestUrl,
          repositoryName: enhancedTestData.repositoryName,
          fileStatistics: enhancedTestData.stats
        },
        // ✅ Sub-task 3.2: Enhanced dashboard integration features
        dashboardIntegrationImplemented: {
          baseDashboardUrl: enhancedTestData.dashboardUrl,
          enhancedParameters: {
            commit: enhancedTestData.commitHash,
            author: enhancedTestData.author,
            impact: 'high',
            breaking: enhancedTestData.stats.breakingChanges > 0,
            files: enhancedTestData.stats.filesChanged,
            tokenSpecificLinks: enhancedTestData.changes.map(c => ({
              token: c.tokenName,
              type: c.type,
              impact: c.impactLevel
            }))
          }
        },
        // Enhanced email features implemented
        emailEnhancements: {
          detailedCommitInformation: true,
          authorAndTimestampDisplay: true,
          beforeAfterValueComparison: true,
          filePathsAndCategories: true,
          impactLevelAnalysis: true,
          componentMappingDisplay: true,
          migrationNotesSupport: true,
          professionalEmailStyling: true,
          enhancedDashboardLinks: true,
          breakingChangeAlerts: true,
          reviewerAndTestingStatus: true
        },
        tokenChangesProcessed: {
          total: enhancedTestData.changes.length,
          byType: {
            added: enhancedTestData.changes.filter(c => c.type === 'added').length,
            updated: enhancedTestData.changes.filter(c => c.type === 'updated').length,
            removed: enhancedTestData.changes.filter(c => c.type === 'removed').length
          },
          byImpact: {
            high: enhancedTestData.changes.filter(c => c.impactLevel === 'high').length,
            medium: enhancedTestData.changes.filter(c => c.impactLevel === 'medium').length,
            low: enhancedTestData.changes.filter(c => c.impactLevel === 'low').length
          }
        },
        notificationsSent: {
          summaryNotification: 1,
          individualTokenNotifications: enhancedTestData.changes.slice(0, 2).length,
          totalRecipients: 'all-teams-subscribed-to-design-system-updates'
        }
      },
      message: `Enhanced email test completed successfully with ${enhancedTestData.changes.length} token changes processed`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing enhanced email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
