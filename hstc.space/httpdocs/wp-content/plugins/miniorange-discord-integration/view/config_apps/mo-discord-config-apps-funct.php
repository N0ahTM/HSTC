<?php
/**
 * Discord configured app function.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Mo discord capp details action
 *
 * @return void
 */
function mo_discord_capp_details_action() {
	$nonce = isset( $_POST['mo_discord_capp_details_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_capp_details_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'mo-discord-capp-details' ) ) {
		wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
	} else {
		if ( current_user_can( 'administrator' ) ) {
			$clientid     = stripslashes( isset( $_POST['app_id'] ) ? sanitize_text_field( wp_unslash( $_POST['app_id'] ) ) : '' );
			$clientsecret = stripslashes( isset( $_POST['app_secret'] ) ? sanitize_text_field( wp_unslash( $_POST['app_secret'] ) ) : '' );
			$scope        = stripslashes( isset( $_POST['app_scope'] ) ? sanitize_text_field( wp_unslash( $_POST['app_scope'] ) ) : '' );
			$appname      = stripslashes( isset( $_POST['app_name'] ) ? sanitize_text_field( wp_unslash( $_POST['app_name'] ) ) : '' );
			if ( get_option( 'mo_discord_login_app' ) ) {
				$appslist = maybe_unserialize( get_option( 'mo_discord_login_app' ) );
			} else {
				$appslist = array();
			}
			$newapp = array();
			foreach ( $appslist as $key => $currentapp ) {
				if ( $appname === $key ) {
					$newapp = $currentapp;
					break;
				}
			}
			$newapp['clientid']     = $clientid;
			$newapp['clientsecret'] = $clientsecret;
			$newapp['scope']        = $scope;
			$appslist[ $appname ]   = $newapp;
			update_option( 'mo_discord_login_app', maybe_serialize( $appslist ) );
			update_option( 'mo_discord_enable_custom_app_' . $appname, '1' );
			update_option( 'mo_' . $appname . '_enable', 1 );
		}
	}
}

/**
 * Aoo delete
 *
 * @return void
 */
function mo_discord_capp_delete() {
	$nonce = isset( $_POST['mo_discord_capp_delete_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_capp_delete_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'mo-discord-capp-delete' ) ) {
		wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
	} else {
		if ( current_user_can( 'administrator' ) ) {
			$appname  = stripslashes( isset( $_POST['app_name'] ) ? sanitize_text_field( wp_unslash( $_POST['app_name'] ) ) : '' );
			$appslist = maybe_unserialize( get_option( 'mo_discord_login_app' ) );
			$status   = get_option( 'mo_discord_enable_custom_app_' . $appname );
			foreach ( $appslist as $key => $app ) {
				if ( $appname === $key ) {
					unset( $appslist[ $key ] );
				}
			}
			if ( ! empty( $appslist ) ) {
				update_option( 'mo_discord_login_app', maybe_serialize( $appslist ) );
			} else {
				delete_option( 'mo_discord_login_app' );
			}
			update_option( 'mo_discord_enable_custom_app_' . $appname, '0' );
			wp_send_json( array( 'status' => $status ) );
		}
	}
}

/**
 * Discord disable app.
 *
 * @return void
 */
function mo_discord_disable_app() {
	$nonce = isset( $_POST['mo_discord_disable_app_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_disable_app_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'mo-discord-disable-app-nonce' ) ) {
		wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
	} else {
		if ( current_user_can( 'administrator' ) ) {
			$appname = isset( $_POST['app_name'] ) ? sanitize_text_field( wp_unslash( $_POST['app_name'] ) ) : '';
			update_option( 'mo_discord_enable_custom_app_' . $appname, 0 );
			update_option( 'mo_' . $appname . '_enable', 0 );
		}
	}
}
/**
 * Update test configuration
 *
 * @return void
 */
function mo_discord_test_configuration_update_action() {
	$nonce = isset( $_POST['mo_discord_test_config_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_test_config_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'mo-discord-test-config-nonce' ) ) {
		wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
	} else {
		if ( current_user_can( 'administrator' ) ) {
			update_option( 'mo_discord_test_configuration', 1 );
		}
	}
}

/**
 * Attribute url.
 *
 * @return string
 */
function mo_discord_attribute_url() {
	$url = home_url();
	return $url;
}

/**
 * Discord register customer toggle update
 *
 * @return void
 */
function mo_discord_register_customer_toggle_update() {
	$nonce = isset( $_POST['mo_discord_toggle_update_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_toggle_update_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'mo-discord-toggle-update-nonce' ) ) {
		wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
	} else {
		if ( mo_discord_is_customer_registered() && current_user_can( 'administrator' ) ) {
			$appname = stripslashes( isset( $_POST['app_name'] ) ? sanitize_text_field( wp_unslash( $_POST['app_name'] ) ) : '' );
			if ( isset( $appname ) ) {
				update_option( 'mo_discord_enable_custom_app_' . $appname, 0 );
			}
			wp_send_json( array( 'status' => true ) );
		} else {
			wp_send_json( array( 'status' => false ) );
		}
	}
}
