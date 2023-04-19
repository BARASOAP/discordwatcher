# Discord Watcher

A simple Discord bot created using TypeScript and discord.js.

## Features

- Sends user custom status changes to a discord channel
- Implements cooldown to prevent spam

## Setup

### Prerequisites

- Node.js (v16.6.0 or higher)
- npm (v7.0.0 or higher)

### Installation

1. Clone this repository:

git clone https://github.com/BARASOAP/discordwatcher.git

cd discordwatcher

3. Install dependencies:

4. Create a `.env` file in the project's root directory and fill the info

WATCHER_ID=''
CHANNEL_ID=''
TOKEN=""

### Running the Bot

1. Compile the TypeScript code:

npm run build

2. Start the bot:

npm run start

The bot should now be running and connected to your Discord server.

## Project Structure

- `src/`: The source folder containing the bot's TypeScript code.
- `index.ts`: The main bot script.
- `dist/`: The output folder generated when you compile your TypeScript code.
- `tsconfig.json`: TypeScript configuration file.
- `.gitignore`: A file specifying which files and directories should be ignored by Git.
- `package.json`: A file containing metadata and dependencies for the project.
- `README.md`: The documentation you're reading right now.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch with your changes.
3. Commit your changes and push the branch.
4. Create a pull request with a description of your changes.

Please ensure your code follows best practices and is properly formatted before submitting a pull request.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
