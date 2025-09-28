<?php
define( 'DISABLE_JETPACK_WAF', false );
if ( defined( 'DISABLE_JETPACK_WAF' ) && DISABLE_JETPACK_WAF ) return;
define( 'JETPACK_WAF_MODE', 'normal' );
define( 'JETPACK_WAF_SHARE_DATA', true );
define( 'JETPACK_WAF_SHARE_DEBUG_DATA', false );
define( 'JETPACK_WAF_DIR', '/var/www/vhosts/hosting190447.a2e8b.netcup.net/hstc.space/httpdocs/wp-content/jetpack-waf' );
define( 'JETPACK_WAF_WPCONFIG', '/var/www/vhosts/hosting190447.a2e8b.netcup.net/hstc.space/httpdocs/wp-content/../wp-config.php' );
define( 'JETPACK_WAF_ENTRYPOINT', 'rules/rules.php' );
require_once '/var/www/vhosts/hosting190447.a2e8b.netcup.net/hstc.space/httpdocs/wp-content/plugins/jetpack/vendor/autoload.php';
Automattic\Jetpack\Waf\Waf_Runner::initialize();
