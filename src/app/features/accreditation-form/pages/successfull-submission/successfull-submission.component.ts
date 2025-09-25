import { Component } from '@angular/core';

@Component({
  selector: 'app-successfull-submission',
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-green-100 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-blue-100 rounded-full blur-3xl animate-pulse delay-1000"
        ></div>
      </div>

      <div class="relative z-10 text-center max-w-md mx-auto">
        <!-- Success Icon -->
        <div
          class="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
        >
          <svg
            class="w-10 h-10 sm:w-12 sm:h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <!-- Main Content -->
        <div
          class="bg-white/80 backdrop-blur-sm py-8 px-6 sm:py-10 sm:px-8 shadow-xl border border-white/20 rounded-2xl"
        >
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Success!</h1>
          <p class="text-lg text-gray-600 mb-6">
            Your application has been submitted successfully.
          </p>
          <p class="text-sm text-gray-500">
            Thank you for your submission. We will review your application and get back to you soon.
          </p>
        </div>

        <!-- Footer -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">BBB Partners Portal</p>
        </div>
      </div>
    </div>
  `,
})
export class SuccessfullSubmissionComponent {}
