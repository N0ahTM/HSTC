<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'k217711_wp_hacqs' );

/** Database username */
define( 'DB_USER', 'k217711_wp_p9nma' );

/** Database password */
define( 'DB_PASSWORD', 'T&8hNZm3I%2AZsYe' );

/** Database hostname */
define( 'DB_HOST', '10.35.46.140:3306' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', 'Hkt!iV@1F);&@3EVy50EE9228@68GW8TDt:mPL8TW]j7On-|k6:sC1(+)uv%yXE5');
define('SECURE_AUTH_KEY', 'YseFQb0[B_o638y&+:Z9waA2jqWo77Lr9p;Fa3)66F*EE]5c-|789:756n&3Uq@4');
define('LOGGED_IN_KEY', '8ay0GJHi/51W!]mZ4]EAHd0Oa0&v#&4DL7zc&sM1Cpymp7b*03Nw6A#N#3;|8IE[');
define('NONCE_KEY', '486qh]O9~PDnLA4nC96Q3m2iZ7//y[:x(!Fz-N58&!%u3iLY1s74%*KbS032%09G');
define('AUTH_SALT', 'C2*iAG*5i(b|r1!wxX/;98pV@&/~N14Q~*DZi9iuHh1IQQ4%;#|Kxai:n37COG+8');
define('SECURE_AUTH_SALT', 'AjpM9C:!%%%6*GU/8K(FFja6ECUb#4;k21/jAltH/8AX|9_p|6md@+5-_7KIKI_B');
define('LOGGED_IN_SALT', '2+1W2-Z-WR#11q8fsSv!f3W4j@V|Y4-774+dW5Sqv6Ij)xM8B]FrTjwW18179l)L');
define('NONCE_SALT', '[_u4ym8bk!N52mZ!0]+hqY4]-iV4c0@0f-(FHt&V5PLy)pExY1v#_@03z4q4OKOT');


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'UuXUeL4P_';


/* Add any custom values between this line and the "stop editing" line. */

define('WP_ALLOW_MULTISITE', true);
/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'DISABLE_WP_CRON', true );
define( 'CONCATENATE_SCRIPTS', false );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
