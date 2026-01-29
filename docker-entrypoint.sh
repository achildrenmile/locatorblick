#!/bin/sh
set -e

CONFIG_FILE="/usr/share/nginx/html/config.json"

# Only generate config if at least one env var is set
if [ -n "$PARENT_SITE_URL" ] || [ -n "$PARENT_SITE_LOGO" ] || [ -n "$PARENT_SITE_NAME" ]; then
    echo "Generating config.json from environment variables..."

    # Create JSON config using heredoc
    cat > "$CONFIG_FILE" << EOF
{
  "parentSiteUrl": "${PARENT_SITE_URL:-}",
  "parentSiteLogo": "${PARENT_SITE_LOGO:-}",
  "parentSiteName": "${PARENT_SITE_NAME:-}"
}
EOF

    echo "Config generated:"
    cat "$CONFIG_FILE"
else
    echo "No PARENT_SITE_* environment variables set, using default config.json"
fi

# Execute the main command (nginx)
exec "$@"
