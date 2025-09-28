<?php
/**
 * Basic Discord app configuration.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Basic Discord app configuration.
 *
 * @package MO_DISCORD_INTEGRATOR
 */
class Mo_Discord {
	/**
	 * Color
	 *
	 * @var string
	 */
	public $color = '#7289DA';
	/**
	 * Predefined scopes
	 *
	 * @var string
	 */
	public $scope = 'identify+email';
	/**
	 * Instruction
	 *
	 * @var string
	 */
	public $instructions;
	/**
	 * Site Url
	 *
	 * @var string
	 */
	public $site_url;

	/**
	 * Constructor function
	 */
	public function __construct() {
		$this->site_url     = get_option( 'siteurl' );
		$this->instructions = "Go to <a href=\"https://discordapp.com/developers\" target=\"_blank\">https://discordapp.com/developers/applications</a> and sign in with your discordapp developer account.##On the page, Click on the <strong>New Application</strong> button and enter a <strong>Name</strong> for your app. Click on Save.##Click on <strong>OAuth2</strong> form left section.</li><li>Click on <b>Add redirect</b> and Enter <b><code id='15'>" . mo_discord_get_permalink( 'discord' ) . 'mo_copytooltiptext\\';
	}
	/**
	 * Get app code
	 *
	 * @return void
	 */
	public function mo_discord_get_app_code() {
		$appslist                = maybe_unserialize( get_option( 'mo_discord_login_app' ) );
		$social_app_redirect_uri = mo_discord_get_social_app_redirect_uri( 'discord' );
		mo_discord_start_session();
		$_SESSION['appname'] = 'discord';
		$client_id           = $appslist['discord']['clientid'];
		$scope               = $appslist['discord']['scope'];
		$login_dialog_url    = 'https://discordapp.com/api/oauth2/authorize?response_type=code&scope=' . $scope . '&client_id=' . $client_id . '&redirect_uri=' . $social_app_redirect_uri;
		header( 'Location:' . $login_dialog_url );
		exit;
	}
	/**
	 * Get access token
	 *
	 * @return array
	 */
	public function mo_discord_get_access_token() {
		$code                    = mo_discord_validate_code();
		$social_app_redirect_uri = mo_discord_get_social_app_redirect_uri( 'discord' );

		$appslist         = maybe_unserialize( get_option( 'mo_discord_login_app' ) );
		$client_id        = $appslist['discord']['clientid'];
		$client_secret    = $appslist['discord']['clientsecret'];
		$access_token_uri = 'https://discordapp.com/api/oauth2/token';
		$post_data        = 'client_id=' . $client_id . '&grant_type=authorization_code&code=' . $code . '&redirect_uri=' . $social_app_redirect_uri . '&scope=identify&client_secret=' . $client_secret;

		$access_token_json_output = mo_discord_get_access_token( $post_data, $access_token_uri, 'discord' );

		$access_token = isset( $access_token_json_output['access_token'] ) ? $access_token_json_output['access_token'] : '';
		mo_discord_start_session();
		$profile_url = 'https://discordapp.com/api/v6/users/@me?access_token=' . $access_token;

		$profile_json_output = mo_discord_get_social_app_data( $access_token, $profile_url, 'discord' );
		// Test Configuration.

		if ( is_user_logged_in() && get_option( 'mo_discord_test_configuration' ) === '1' ) {
			mo_discord_app_test_config( $profile_json_output );
		}
		$first_name    = $last_name = $email = $user_name = $user_url = $user_picture = $social_user_id = ''; //phpcs:ignore --ignoring multiple assign error since it will cause unnecesarry repeated code	
		if ( isset( $profile_json_output['username'] ) ) {
			$user_name  = isset( $profile_json_output['username'] ) ? $profile_json_output['username'] : '';
			$full_name  = explode( ' ', $user_name );
			$first_name = isset( $full_name[0] ) ? $full_name[0] : '';
			$last_name  = isset( $full_name[1] ) ? $full_name[1] : '';
		}
			$email          = isset( $profile_json_output['email'] ) ? $profile_json_output['email'] : '';
			$user_name      = isset( $profile_json_output['username'] ) ? $profile_json_output['username'] : '';
			$user_url       = isset( $profile_json_output['url'] ) ? $profile_json_output['url'] : '';
			$user_picture   = isset( $profile_json_output['avatar'] ) ? 'https://cdn.discordapp.com/avatars/' . $profile_json_output['id'] . '/' . $profile_json_output['avatar'] : '';
			$social_user_id = isset( $profile_json_output['id'] ) ? $profile_json_output['id'] : '';
			$discriminator  = isset( $profile_json_output['discriminator'] ) ? $profile_json_output['discriminator'] : '';
			$public_flags   = isset( $profile_json_output['public_flags'] ) ? $profile_json_output['public_flags'] : '';
			$flags          = isset( $profile_json_output['flags'] ) ? $profile_json_output['flags'] : '';
			$banner         = isset( $profile_json_output['banner'] ) ? $profile_json_output['banner'] : '';
			$banner_color   = isset( $profile_json_output['banner_color'] ) ? $profile_json_output['banner_color'] : '';
			$accent_color   = isset( $profile_json_output['accent_color'] ) ? $profile_json_output['accent_color'] : '';
			$locale         = isset( $profile_json_output['locale'] ) ? $profile_json_output['locale'] : '';
			$verified       = isset( $profile_json_output['verified'] ) ? $profile_json_output['verified'] : '';
			$mfa_enabled    = isset( $profile_json_output['mfa_enabled'] ) ? $profile_json_output['mfa_enabled'] : '';

		$appuserdetails = array(
			'first_name'     => $first_name,
			'last_name'      => $last_name,
			'email'          => $email,
			'username'       => $user_name,
			'user_url'       => $user_url,
			'avatar'         => $user_picture,
			'id'             => $social_user_id,
			'social_user_id' => $social_user_id,
			'discriminator'  => $discriminator,
			'public_flags'   => $public_flags,
			'flags'          => $flags,
			'banner'         => $banner,
			'banner_color'   => $banner_color,
			'accent_color'   => $accent_color,
			'locale'         => $locale,
			'verified'       => $verified,
			'mfa_enabled'    => $mfa_enabled,
		);

		return $appuserdetails;
	}
}
