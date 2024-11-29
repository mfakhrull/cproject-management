import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			white: '#ffffff',
  			gray: {
  				'100': '#f3f4f6',
  				'200': '#e5e7eb',
  				'300': '#d1d5db',
  				'500': '#6b7280',
  				'700': '#374151',
  				'800': '#1f2937'
  			},
  			blue: {
  				'200': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6'
  			},
  			'dark-bg': '#101214',
  			'dark-secondary': '#1d1f21',
  			'dark-tertiary': '#3b3d40',
  			'blue-primary': '#0275ff',
  			'stroke-dark': '#2d3135',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				foreground: 'hsl(var(--brand-foreground))'
  			},
  			highlight: {
  				DEFAULT: 'hsl(var(--highlight))',
  				foreground: 'hsl(var(--highlight-foreground))'
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		screens: {
  			'main-hover': {
  				raw: '(hover: hover)'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
};
export default config;
