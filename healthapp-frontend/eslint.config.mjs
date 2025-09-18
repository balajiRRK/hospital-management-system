import { FlatCompat } from '@eslint/eslintrc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const compat = new FlatCompat();

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  {
    files: ['{app,components,lib,src}/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'public/**',
      '.turbo/**',
      '.vercel/**',
      'next-env.d.ts',
      '**/*.d.ts',
      'eslint.config.{js,cjs,mjs,ts}',
      'postcss.config.{js,cjs,mjs,ts}',
      'next.config.{js,cjs,mjs,ts}',
      'tailwind.config.{js,cjs,mjs,ts}',
      'prettier.config.{js,cjs,mjs,ts}',
    ],
  },
];

export default config;
