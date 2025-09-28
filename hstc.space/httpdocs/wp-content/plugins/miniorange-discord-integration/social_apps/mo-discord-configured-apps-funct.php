<?php
/**
 * Discord configured app function.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * MO discord validate code.
 *
 * @return string
 */
function mo_discord_validate_code() {
	if ( isset( $_REQUEST['code'] ) ) { //phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Ignoring nonce verification because we are fetching data from URL and not on form submission.
		$code = sanitize_text_field( wp_unslash( $_REQUEST['code'] ) ); //phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Ignoring nonce verification because we are fetching data from URL and not on form submission.
		return $code;
	} elseif ( array_key_exists( 'error', $_REQUEST ) ) { //phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Ignoring nonce verification because we are fetching data from URL and not on form submission.
		if ( is_user_logged_in() && get_option( 'mo_discord_test_configuration' ) === '1' ) {
			update_option( 'mo_discord_test_configuration', 0 );
			echo '<div style="color: #a94442;background-color: #f2dede;padding: 15px;margin-bottom: 20px;text-align:center;border:1px solid #E6B3B2;font-size:18pt;">TEST FAILED</div>
						<div style="color: #a94442;font-size:14pt; margin-bottom:20px;">WARNING: Please enter correct scope value and try again. <br/>';
			echo ( esc_attr( sanitize_text_field( $_REQUEST ) ) );//phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Ignoring nonce verification because we are fetching data from URL and not on form submission.
			echo '</div>
						<div style="display:block;text-align:center;margin-bottom:4%;"><img style="width:15%;"src="' . esc_attr( plugin_dir_url( dirname( __FILE__ ) ) ) . '/includes/images/wrong.png"></div>';
			exit;
		} else {
			echo esc_attr(
				isset( $_REQUEST['error_description'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['error_description'] ) ) : '' //phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Ignoring nonce verification because we are fetching data from URL and not on form submission.
			) . '<br>';
			wp_die( 'Allow access to your profile to get logged in. Click <a href=' . esc_url( get_site_url() ) . '>here</a> to go back to the website.' );
			exit;
		}
	}
}

/**
 * Get permalink
 *
 * @param [string] $appname app name.
 * @return string
 */
function mo_discord_get_permalink( $appname ) {
	$value       = get_option( 'siteurl' );
	$apps2_list  = array( 'discord' );
	$apps_config = 0;
	foreach ( $apps2_list as $key ) {
		if ( $appname === $key ) {
			$apps_config = 1;
			break;
		}
	}
	if ( get_option( 'mo_discord_malform_error' ) || '1' === $apps_config ) {
		if ( get_option( 'permalink_structure' ) ) {
			return $value . '/disidcallback/' . $appname;
		} else {
			return $value . '/?disidcallback=' . $appname;
		}
	} else {
		if ( get_option( 'permalink_structure' ) ) {
			return $value . '/disidcallback';
		} else {
			return $value . '/?disidcallback';
		}
	}
}

/**
 * Get social redirect url.
 *
 * @param [string] $appname name of app.
 * @return string
 */
function mo_discord_get_social_app_redirect_uri( $appname ) {
	$apps2_list  = array( 'discord' );
	$apps_config = 0;
	foreach ( $apps2_list as $key ) {
		if ( $appname === $key ) {
			$apps_config = 1;
			break;
		}
	}
	if ( get_option( 'mo_discord_malform_error' ) || '1' === $apps_config ) {
		if ( get_option( 'permalink_structure' ) ) {
			$social_app_redirect_uri = site_url() . '/disidcallback/' . $appname;
		} else {
				$social_app_redirect_uri = site_url() . '/?disidcallback=' . $appname;
		}
	} else {
		if ( get_option( 'permalink_structure' ) ) {
			$social_app_redirect_uri = site_url() . '/disidcallback';
		} else {
				$social_app_redirect_uri = site_url() . '/?disidcallback';
		}
	}
	return $social_app_redirect_uri;
}

/**
 * Get access token
 *
 * @param [array]  $post_data data.
 * @param [string] $access_token_uri url.
 * @param [string] $appname app name.
 * @return array
 */
function mo_discord_get_access_token( $post_data, $access_token_uri, $appname ) {
	$headers = '';

	$args   = array(
		'method'      => 'POST',
		'body'        => $post_data,
		'timeout'     => '15',
		'redirection' => '5',
		'httpversion' => '1.0',
		'blocking'    => true,
		'headers'     => $headers,
	);
	$result = wp_remote_post( $access_token_uri, $args );
	if ( is_wp_error( $result ) ) {
		update_option( 'mo_discord_test_configuration', 0 );
		echo esc_attr( $result['body'] );
		exit();
	}
	$access_token_json_output = json_decode( $result['body'], true );
	if ( ( array_key_exists( 'error', $access_token_json_output ) ) || array_key_exists( 'error_message', $access_token_json_output ) ) {
		if ( is_user_logged_in() && get_option( 'mo_discord_test_configuration' ) === '1' ) {
			update_option( 'mo_discord_test_configuration', 0 );
			// Test configuration failed window.

			echo '<div style="color: #a94442;background-color: #f2dede;padding: 15px;margin-bottom: 20px;text-align:center;border:1px solid #E6B3B2;font-size:18pt;">TEST FAILED</div>
                    <div style="color: #a94442;font-size:14pt; margin-bottom:20px;">WARNING: Client secret is incorrect for this app. Please check the client secret and try again.<br/>';
			echo ( esc_attr( $access_token_json_output ) );
			echo '</div>
                    <div style="display:block;text-align:center;margin-bottom:4%;"><img style="width:15%;"src="' . esc_attr( plugin_dir_url( dirname( __FILE__ ) ) ) . '/includes/images/wrong.png"></div>';
			exit;
		}
	}
	return $access_token_json_output;
}
/**
 * Undocumented function
 *
 * @param [type] $access_token Access Token.
 * @param [type] $profile_url Profile URL.
 * @param [type] $app_name App name.
 * @return array
 */
function mo_discord_get_social_app_data( $access_token, $profile_url, $app_name ) {

	$headers = ( 'Authorization:Bearer ' . $access_token );

	$args = array(
		'timeout'     => 120,
		'redirection' => 5,
		'httpversion' => '1.1',
		'headers'     => $headers,
	);

	$result = wp_remote_get( $profile_url, $args );
	if ( is_wp_error( $result ) ) {
		update_option( 'mo_discord_test_configuration', 0 );
		echo esc_attr( $result['body'] );
		exit();
	}
	$profile_json_output = json_decode( $result['body'], true );
	return $profile_json_output;
}
/**
 * Test Configuration
 *
 * @param [array] $profile_json_output output.
 * @return void
 */
function mo_discord_app_test_config( $profile_json_output ) {
	update_option( 'mo_discord_test_configuration', 0 );
	$print  = '<div style="color: #3c763d;
        background-color: #dff0d8; padding:2%;margin-bottom:20px;text-align:center; border:1px solid #AEDB9A; font-size:18pt;">TEST SUCCESSFUL</div>
        <div style="display:block;text-align:center;margin-bottom:1%;"><img style="width:15%;"src="' . plugin_dir_url( dirname( __FILE__ ) ) . '/includes/images/green_check.png"></div>';
	$print .= mo_discord_json_to_htmltable( $profile_json_output );
	echo wp_kses_post( $print );
	exit;
}

/**
 * Json to html
 *
 * @param [array] $arr array.
 * @return string
 */
function mo_discord_json_to_htmltable( $arr ) {
	$str = "<table border='1'><tbody>";
	foreach ( $arr as $key => $val ) {
		$str .= '<tr>';
		$str .= "<td>$key</td>";
		$str .= '<td>';
		if ( is_array( $val ) ) {
			if ( ! empty( $val ) ) {
				$str .= mo_discord_json_to_htmltable( $val );
			}
		} else {
			$str .= "<strong>$val</strong>";
		}
		$str .= '</td></tr>';
	}
	$str .= '</tbody></table>';

	return $str;
}

/**
 * Insert Query.
 *
 * @param [string] $social_app_name Social app name.
 * @param [string] $user_email email.
 * @param [string] $userid user id.
 * @param [string] $social_app_identifier identifier.
 * @return void
 */
function mo_discord_insert_query( $social_app_name, $user_email, $userid, $social_app_identifier ) {

	if ( ! empty( $social_app_name ) && ! empty( $user_email ) && ! empty( $userid ) && ! empty( $social_app_identifier ) ) {
		$date = gmdate( 'Y-m-d H:i:s' );

		global $wpdb;
		$db_prefix  = $wpdb->prefix;
		$table_name = $db_prefix . 'mo_discord_linked_user';
		//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
		$result = $wpdb->insert(
			$table_name,
			array(
				'linked_social_app' => $social_app_name,
				'linked_email'      => $user_email,
				'user_id'           => $userid,
				'identifier'        => $social_app_identifier,
				'timestamp'         => $date,
			),
			array(
				'%s',
				'%s',
				'%d',
				'%s',
				'%s',
			)
		);
		if ( false === $result ) {
			wp_die( 'Error in insert query' );
		}
	}
}

/**
 * Start session login
 *
 * @param [array] $session_values session value.
 * @return void
 */
function mo_discord_start_session_login( $session_values ) {
	mo_discord_start_session();
	$_SESSION['mo_login']        = true;
	$_SESSION['registered_user'] = '1';
	$_SESSION['username']        = isset( $session_values['username'] ) ? $session_values['username'] : '';
	$_SESSION['user_email']      = isset( $session_values['user_email'] ) ? $session_values['user_email'] : '';
	$_SESSION['user_full_name']  = isset( $session_values['user_full_name'] ) ? $session_values['user_full_name'] : '';
	$_SESSION['first_name']      = isset( $session_values['first_name'] ) ? $session_values['first_name'] : '';
	$_SESSION['last_name']       = isset( $session_values['last_name'] ) ? $session_values['last_name'] : '';
	$_SESSION['user_url']        = isset( $session_values['user_url'] ) ? $session_values['user_url'] : '';
	$_SESSION['user_picture']    = isset( $session_values['user_picture'] ) ? $session_values['user_picture'] : '';
	$_SESSION['social_app_name'] = isset( $session_values['social_app_name'] ) ? $session_values['social_app_name'] : '';
	$_SESSION['social_user_id']  = isset( $session_values['social_user_id'] ) ? $session_values['social_user_id'] : '';
}
/**
 * Login discord user.
 *
 * @param [string] $linked_email_id linked email id discord.
 * @param [string] $user_id user id.
 * @param [string] $user user.
 * @param [string] $user_picture picture.
 * @param [string] $user_mod_msg msg.
 * @param string   $user_fullname user full name.
 * @return void
 */
function mo_discord_login_user( $linked_email_id, $user_id, $user, $user_picture, $user_mod_msg, $user_fullname = '' ) {
	if ( get_option( 'mo_discord_social_login_avatar' ) && isset( $user_picture ) ) {
		update_user_meta( $user_id, 'modiscord_user_avatar', $user_picture );
	}
	if ( get_option( 'mo_dis_basic_role_mapping' ) ) {
		$user = get_user_by( 'ID', $user_id );
		$user->set_role( get_option( 'mo_dis_basic_role_mapping' ) );
	}
	if ( '' !== $user_fullname ) {
		wp_update_user(
			array(
				'ID'           => $user_id,
				'display_name' => $user_fullname,
			)
		);
	}
	do_action( 'wp_login', $user->user_login, $user );
		exit;
}

/**
 * Delete rows from account linking table that correspond to deleted user.
 *
 * @param [string] $user_id id.
 * @return void
 */
function mo_discord_delete_account_linking_rows( $user_id ) {
	global $wpdb;
	$result = $wpdb->get_var( $wpdb->prepare( 'DELETE from ' . $wpdb->prefix . 'mo_discord_linked_user where user_id = %s ', $user_id ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
	if ( false === $result ) {
		wp_die( esc_attr( get_option( 'mo_delete_user_error_message' ) ) );
	}
}

