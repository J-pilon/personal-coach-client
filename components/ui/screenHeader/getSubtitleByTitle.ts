const TITLE_SUBTITLE_MAP: Record<string, string> = {
  Profile: 'Manage your account and coaching preferences.',
  'My Smart Goals': 'Track your goals and focus on what matters most.',
  'Goal Details': 'Review milestones, progress, and your next steps.',
  'Task Details': 'See task context and keep execution on track.',
  'New Task': 'Capture your next clear, actionable step.',
  'How to Use': 'Learn quick tips to get the most from the app.',
  'Support & Feedback': 'Get help fast and share product feedback.',
  Settings: 'Customize your experience and app behavior.',
  'New Goal': 'Create a SMART goal with clear direction.',
  Entries: 'Reflect on your day and log key insights.',
  'Entry Details': 'Review your reflection and track your growth.',
  'Oops!': 'This page is unavailable. Let us get you back on track.',
};

export function getSubtitleByTitle(title: string): string {
  return TITLE_SUBTITLE_MAP[title] ?? '';
}

