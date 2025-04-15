/**
 * Test Spinner Animation
 */

// Spinner animation frames and colors
const spinnerFrames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

// Spinner class for better management
class Spinner {
  constructor() {
    this.frame = 0;
    this.timer = null;
    this.text = '';
    this.active = false;
  }

  start(text) {
    this.text = text;
    this.active = true;
    this.frame = 0;

    if (this.timer) {
      clearInterval(this.timer);
    }

    // Clear the current line
    process.stdout.write('\r\x1b[K');

    this.timer = setInterval(() => {
      if (!this.active) return;
      const frame = spinnerFrames[this.frame];
      process.stdout.write(
        `\r${colors.cyan}${frame}${colors.reset} ${this.text}`
      );
      this.frame = (this.frame + 1) % spinnerFrames.length;
    }, 80);

    return this;
  }

  stop(finalText, success = true) {
    this.active = false;
    clearInterval(this.timer);
    this.timer = null;

    const symbol = success
      ? `${colors.green}✓${colors.reset}`
      : `${colors.red}✗${colors.reset}`;
    process.stdout.write(`\r\x1b[K${symbol} ${finalText}\n`);

    return this;
  }

  update(text) {
    this.text = text;
    return this;
  }
}

const spinner = new Spinner();

// Test function for the spinner
async function testSpinner() {
  console.log(`${colors.cyan}🧪${colors.reset} Testing spinner animation...\n`);

  for (let i = 1; i <= 3; i++) {
    spinner.start(`Processing test item ${i}/3...`);

    // Simulate some work (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    spinner.stop(`Completed test item ${i}/3`, true);
  }

  // Test an error case
  spinner.start(`Testing error case...`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  spinner.stop(`This is how an error looks`, false);

  console.log(`\n${colors.green}✅${colors.reset} Spinner test complete!`);
}

// Run the test
testSpinner().catch((error) => {
  console.error(`${colors.red}❌${colors.reset} Test failed:`, error);
});
