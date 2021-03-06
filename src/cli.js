import arg from 'arg';
import inquirer from 'inquirer';
import { createTsProject } from './main.js';

function parserArgumentsIntoOptions(rawArgs) {
   const args = arg(
      {
         '--help': Boolean,
         '--all': Boolean,
         '--git': Boolean,
         '--install': Boolean,
         '--nodemon': Boolean,
         '--eslint': Boolean,
         '--pre-commit-hook': Boolean,
         '--editorconfig': Boolean,
         '--ts': Boolean,
         '--name': String,
         '--yarn': Boolean,
         '--npm': Boolean,
         '--pnpm': Boolean,
         '-t': '--ts',
         '-a': '--all',
         '-h': '--help',
         '-g': '--git',
         '-i': '--install',
         '-r': '--nodemon',
         '-l': '--eslint',
         '-p': '--pre-commit-hook',
         '-e': '--editorconfig',
         '-n': '--name',
      },
      {
         argv: rawArgs.slice(-2),
         permissive: false,
      },
   );

   let packageManager = 'pnpm';

   if (args['--yarn']) {
      packageManager = 'yarn';
   } else if (args['--npm']) {
      packageManager = 'npm';
   }

   return {
      help: args['--help'] || false,
      skipPrompts: args['--all'] || false,
      git: args['--git'] || false,
      runInstall: args['--install'] || false,
      nodemon: args['--nodemon'] || false,
      eslint: args['--eslint'] || false,
      preCommitHook: args['--pre-commit-hook'] || false,
      editorConfig: args['--editorconfig'] || false,
      ts: args['--ts'] || false,
      packageManager,
      name: args['--name'] || '',
      targetDirectory: process.cwd(),
   };
}

// eslint-disable-next-line
async function promptForMissingOptions(options) {
   const questions = [];

   questions.push({
      type: 'input',
      name: 'name',
      message: 'Choose your project name:',
      default: 'my-app',
   });

   questions.push({
      type: 'list',
      name: 'packageManager',
      message: 'Choose your favorite package manager:',
      choices: ['npm', 'yarn', 'pnpm'],
      default: 'pnpm',
   });

   questions.push({
      type: 'confirm',
      name: 'ts',
      message: 'Integrate typescript to project (your .ts file will be in src/ folder) ?',
      default: false,
   });

   questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Create a new git repository ?',
      default: false,
   });

   questions.push({
      type: 'confirm',
      name: 'runInstall',
      message: 'Install node_modules',
      default: true,
   });

   questions.push({
      type: 'confirm',
      name: 'eslint',
      message: 'Integrate eslint(coding style guide) ?',
      default: false,
   });

   questions.push({
      type: 'confirm',
      name: 'editorConfig',
      message: 'Create .editorconfig file ?',
      default: false,
   });

   if (options.ts) {
      questions.push({
         type: 'confirm',
         name: 'nodemon',
         message: 'Integrate nodemon(hot reloading code) ?',
         default: false,
      });
   }

   if (options.eslint && options.git) {
      questions.push({
         type: 'confirm',
         name: 'preCommitHook',
         message: 'Use pre-commit hook(check eslint before commit) ?',
         default: false,
      });
   }

   const answers = await inquirer.prompt(questions);

   return {
      ...options,
      packageManager: answers.packageManager || options.packageManager,
      git: answers.git || options.git,
      runInstall: answers.runInstall || options.runInstall,
      nodemon: answers.nodemon || options.nodemon,
      eslint: answers.eslint || options.eslint,
      preCommitHook: answers.preCommitHook || options.preCommitHook,
      editorConfig: answers.editorConfig || options.editorConfig,
      name: answers.name || options.name,
      ts: answers.ts || options.ts,
   };
}

function showHelp() {
   const helps = [
      'USAGE: ts-gun [OPTION]',
      'Initalize typescript project with some essential tools',
      'Example: ts-gun -s\n',
      'OPTIONS:',
      '          --npm                  use npm as package manager',
      '          --pnpm                 use pnpm as package manager',
      '          --yarn                 use yarn as package manager',
      '   -h,    --help                 show help menu',
      '   -a,    --all                  use pnpm as package manager and install all tools(eslint, install node_module, nodemon, editorconfig, pre-commit-hook, init git repository)',
      '   -n,    --name                 will create a folder with given name in current directory. other configuration files will be placed inside this folder',
      '   -t,    --ts                   initialize typescript to project',
      '   -g,    --git                  initialize new git repository',
      '   -i,    --install              install node_modules and dependencies for eslint(if eslint option is true), typescript(if ts option is true)',
      '   -r,    --nodemon              integrate nodemon to project',
      '   -e,    --eslint               integrate eslint to project. Use airbnb-base style guide',
      '   -p,    --pre-commit-hook      use pre-commit-hook. Will run script "lint" and "test" in package.json file. .git folder is required',
      '   -e,    --editorconfig         create .editorconfig file\n',
      'NOTE: this package is not stable yet, if you have any problem, please go to: https://www.npmjs.com/package/ts-gun for more details\n',
   ];

   return process.stdout.write(helps.join('\n'));
}

// eslint-disable-next-line
export async function cli(args) {
   let options = parserArgumentsIntoOptions(args);

   // if no agurment is set, show prompt
   if (args.length === 2) {
      options = await promptForMissingOptions(options);
   }

   // return help content if options.help is true
   if (options.help) {
      return showHelp();
   }

   if (options.skipPrompts) {
      options = {
         ...options,
         git: true,
         runInstall: true,
         nodemon: true,
         eslint: true,
         preCommitHook: true,
         editorConfig: true,
         ts: true,
      };
   }

   // set target directory
   if (options.name) {
      options.targetDirectory = options.targetDirectory.concat(`/${options.name}`);
   }

   // run tasks
   await createTsProject(options);
}
