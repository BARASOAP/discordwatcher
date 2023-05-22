# Discord Watcher

A powerful and customizable Discord bot that tracks user status changes.

## Features

1. Tracks status changes of the designated user, the Watcher.
2. Notifies a specific text channel when the Watcher's status changes.
3. Includes a circular buffer to avoid duplicate notifications for recent status changes.
4. Provides a debug mode for easier development and debugging.
5. Allows admin control for various operations via DM commands.

### Commands available for the Admin via DM:

1. 'debug true': Enables debug mode.
2. 'debug false': Disables debug mode.
3. 'debug status': Gets the current status of the bot, including uptime and debug mode.
4. 'debug cleartimeout': Clears the current timeout for the presence update event.
5. 'debug gettimeout': Gets the time remaining for the presence update event timeout.

## Setup

### Prerequisites

- Node.js (v16.6.0 or higher)
- npm (v7.0.0 or higher)
- Docker

### Installation

1. Clone this repository:

```bash
git clone https://github.com/YOUR_USERNAME/discordwatcher.git
cd discordwatcher
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project's root directory and fill in your Discord bot token and other necessary environment variables:

```bash
TOKEN=your_discord_bot_token
WATCHER_ID=user_id
CHANNEL_ID=channel_id
ADMIN_ID=admin_user_id
EMBED_COLOR=color_code(ex.0099FF)
EMBED_FOOTER_TEXT=bot_name
```

### Running the Bot

1. Compile the TypeScript code:

```bash
npm run build
```

2. Start the bot using Docker:

```bash
docker-compose up --build -d
```

The bot should now be running and connected to your Discord server.

## Project Structure

- `src/`: The source folder containing the bot's TypeScript code.
- `dist/`: The output folder generated when you compile your TypeScript code.
- `Dockerfile`: Instructions for building a Docker image of the bot.
- `docker-compose.yml`: Instructions for running the bot using Docker Compose.
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