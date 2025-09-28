<?php
/**
 * Login Functionality.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Adding required files.
 */
require 'social_apps/mo-discord-configured-apps-funct.php';
/**
 * Start session
 *
 * @return void
 */
function mo_discord_start_session() {
	if ( ! session_id() ) {
		session_start();
	}
}

/**
 * Custom Oauth Redirect.
 *
 * @param [string] $appname APP NAME.
 * @return void
 */
function mo_discord_custom_app_oauth_redirect( $appname ) {
	$set_test = isset( $_REQUEST['test'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['test'] ) ) : '';//phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Ignoring nonce verification because we are fetching data from URL and not on form submission.
	if ( isset( $set_test ) ) {
		setcookie( 'mo_oauth_test', true );
	} else {
		setcookie( 'mo_oauth_test', false );
	}

	require 'social_apps/class-mo-' . $appname . '.php';
	$mo_appname = 'mo_' . $appname;
	$social_app = new $mo_appname();
	$social_app->mo_discord_get_app_code();
}

/**
 * Custom callback.
 *
 * @return void
 */
function mo_discord_process_custom_app_callback() {
	$appname = '';

	if ( is_user_logged_in() && get_option( 'mo_discord_test_configuration' ) !== '1' ) {
		return;
	}
	$code               = $profile_url = $client_id = $current_url = $client_secret = $access_token_uri = $postData = $oauth_token = $user_url = $user_name = $email = '';//phpcs:ignore --ignoring multiple assign error since it will cause unnecesarry repeated code
	$oauth_access_token = $redirect_url = $option = $oauth_token_secret = $screen_name = $profile_json_output = $oauth_verifier = $twitter_oauth_token = $access_token_json_output = array();//phpcs:ignore --ignoring multiple assign error since it will cause unnecesarry repeated code
	mo_discord_start_session();
	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
	if ( isset( $_SESSION['appname'] ) ) {
		$appname = sanitize_text_field( $_SESSION['appname'] );
	} elseif ( strpos( $request_uri, 'disidcallback' ) !== false ) {
		if ( ( strpos( $request_uri, 'disidcallback/discord' ) !== false ) || ( strpos( $request_uri, 'disidcallback=discord' ) !== false ) ) {
			$appname = 'discord';
		}
	} else {
		return;
	}
	require 'social_apps/class-mo-' . $appname . '.php';
	$mo_appname     = 'mo_' . $appname;
	$social_app     = new $mo_appname();
	$appuserdetails = $social_app->mo_discord_get_access_token();
	mo_discord_process_user_details( $appuserdetails, $appname );
}

/**
 * Procees user details
 *
 * @param [mixed] $appuserdetails App user details.
 * @param [mixed] $appname App name.
 * @return void
 */
function mo_discord_process_user_details( $appuserdetails, $appname ) {
	 $first_name   = $last_name = $email = $user_name = $user_url = $user_picture = $social_user_id = $full_name = $about_me = '';//phpcs:ignore --ignoring multiple assign error since it will cause unnecesarry repeated code
	// attribute.
	$at_email       = get_option( 'mo_discord_attr_email' );
	$at_username    = get_option( 'mo_discord_attr_username' );
	$at_displayname = get_option( 'mo_discord_attr_display_name' );

	$first_name = isset( $appuserdetails['first_name'] ) ? esc_attr( $appuserdetails['first_name'] ) : '';
	$last_name  = isset( $appuserdetails['last_name'] ) ? esc_attr( $appuserdetails['last_name'] ) : '';
	$email      = isset( $at_email ) ? ( isset( $appuserdetails[ $at_email ] ) ? $appuserdetails[ $at_email ] : '' ) : ( isset( $appuserdetails['email'] ) ? $appuserdetails['email'] : '' );
	$user_name  = isset( $at_username ) ? ( isset( $appuserdetails[ $at_username ] ) ? $appuserdetails[ $at_username ] : '' ) : ( isset( $appuserdetails['username'] ) ? $appuserdetails['username'] : '' );

	$user_url       = isset( $appuserdetails['user_url'] ) ? esc_url( $appuserdetails['user_url'] ) : '';
	$user_picture   = isset( $appuserdetails['avatar'] ) ? esc_url( $appuserdetails['avatar'] ) : '';
	$social_user_id = isset( $appuserdetails['social_user_id'] ) ? esc_attr( $appuserdetails['social_user_id'] ) : '';

	$user_name = str_replace( ' ', '-', $user_name );
	$user_name = sanitize_user( $user_name, true );

	if ( '-' === $user_name || '' === $user_name ) {
		$splitemail = explode( '@', $email );
		$user_name  = $splitemail[0];
	}

	// Set User Full Name.
	if ( isset( $at_displayname ) ) {
		$user_full_name = isset( $appuserdetails[ $at_displayname ] ) ? sanitize_user( $appuserdetails[ $at_displayname ] ) : '';
	} elseif ( isset( $first_name ) && isset( $last_name ) ) {
		if ( strcmp( $first_name, $last_name ) !== 0 ) {
			$user_full_name = $first_name . ' ' . $last_name;
		} else {
			$user_full_name = $first_name;
		}
	} elseif ( isset( $first_name ) ) {
		$user_full_name = $first_name;
	} else {
		$user_full_name = $user_name;
		$first_name     = '';
		$last_name      = '';
	}
	// check_existing_user.
	global $wpdb;
	$linked_email_id = $wpdb->get_var( $wpdb->prepare( 'SELECT user_id FROM ' . $wpdb->prefix . 'mo_discord_linked_user where linked_social_app = %s AND identifier = %s', $appname, $social_user_id ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.

	$user_email = sanitize_email( $email );

	$email_user_id = $wpdb->get_var( $wpdb->prepare( 'SELECT user_id FROM ' . $wpdb->prefix . 'mo_discord_linked_user where linked_email = %s', $user_email ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.

	if ( empty( $user_email ) ) {
		$existing_email_user_id = null;
	} else {
		$existing_email_user_id = $wpdb->get_var( $wpdb->prepare( 'SELECT ID FROM ' . $wpdb->users . ' where user_email = %s', $user_email ) ); //phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
	}

	$session_values = array(
		'username'        => $user_name,
		'user_email'      => $user_email,
		'user_full_name'  => $user_full_name,
		'first_name'      => $first_name,
		'last_name'       => $last_name,
		'user_url'        => $user_url,
		'user_picture'    => $user_picture,
		'social_app_name' => $appname,
		'social_user_id'  => $social_user_id,
	);
	mo_discord_start_session_login( $session_values );
	if ( ( isset( $linked_email_id ) ) || ( isset( $email_user_id ) ) || ( isset( $existing_email_user_id ) ) ) {
		if ( ( ! isset( $linked_email_id ) ) && ( isset( $email_user_id ) ) ) {
			$linked_email_id = $email_user_id;
			mo_discord_insert_query( $appname, $user_email, $linked_email_id, $social_user_id );
		}
		if ( isset( $linked_email_id ) ) {
			$user    = get_user_by( 'id', $linked_email_id );
			$user_id = $user->ID;
		} elseif ( isset( $email_user_id ) ) {
			$user    = get_user_by( 'id', $email_user_id );
			$user_id = $user->ID;
		} else {
			$user    = get_user_by( 'id', $existing_email_user_id );
			$user_id = $user->ID;
		}
		mo_discord_login_user( $linked_email_id, $user_id, $user, $user_picture, 1, $user_full_name );
	}
	mo_discord_create_new_user( $session_values );
}

/**
 * Discord create new user.
 *
 * @param [mixed] $user_val user val.
 * @return void
 */
function mo_discord_create_new_user( $user_val ) {
	$user_name      = $user_val['username'];
	$email          = $user_val['user_email'];
	$user_full_name = $user_val['user_full_name'];
	$first_name     = $user_val['first_name'];
	$last_name      = $user_val['last_name'];
	$user_url       = $user_val['user_url'];
	$user_picture   = $user_val['user_picture'];
	$appname        = $user_val['social_app_name'];
	$social_user_id = $user_val['social_user_id'];
	global $wpdb;
	$linked_email_id = $wpdb->get_var( $wpdb->prepare( 'SELECT user_id FROM ' . $wpdb->prefix . 'mo_discord_linked_user where linked_social_app = %s AND identifier = %s', $appname, $social_user_id ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
	$user_email      = sanitize_email( $email );
	if ( empty( $user_name ) && ! empty( $email ) ) {
		$split_email = explode( '@', $email );
		$user_name   = $split_email[0];
		$user_email  = $email;
	} elseif ( empty( $email ) && ! empty( $user_name ) ) {
		$split_app_name = explode( '_', $appname );
		$user_email     = $user_name . '@' . $split_app_name[0] . '.com';
	} elseif ( empty( $email ) && empty( $user_name ) ) {
		wp_die( 'No profile data is returned from application. Please contact your administrator.' );
	}

	$user_email = str_replace( ' ', '', $user_email );

	$random_password  = wp_generate_password( 10, false );
	$user_profile_url = $user_url;

	if ( isset( $appname ) && ! empty( $appname ) ) {
		$user_url = '';
	}

	// Checking if username already exist.
	$user_name_user_id = $wpdb->get_var( $wpdb->prepare( 'SELECT ID FROM ' . $wpdb->users . ' where user_login = %s', $user_name ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.

	if ( isset( $user_name_user_id ) ) {
		$email_array       = explode( '@', $user_email );
		$user_name         = $email_array[0];
		$user_name_user_id = $wpdb->get_var( $wpdb->prepare( 'SELECT ID FROM ' . $wpdb->users . ' where user_login = %s', $user_name ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
		$i                 = 1;
		while ( ! empty( $user_name_user_id ) ) {
			$uname             = $user_name . '_' . $i;
			$user_name_user_id = $wpdb->get_var( $wpdb->prepare( 'SELECT ID FROM ' . $wpdb->prefix . 'users where user_login = %s', $uname ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
			$i++;
			if ( empty( $user_name_user_id ) ) {
				$user_name = $uname;
			}
		}

		if ( isset( $user_name_user_id ) ) {
			echo '<br/>Error Code Existing Username: ' . esc_attr( get_option( 'mo_existing_username_error_message' ) );
			exit();
		}
	}

	$userdata = array(
		'user_login'   => $user_name,
		'user_email'   => $user_email,
		'user_pass'    => $random_password,
		'display_name' => $user_full_name,
		'first_name'   => $first_name,
		'last_name'    => $last_name,
		'user_url'     => $user_url,
	);
	$user_id  = wp_insert_user( $userdata );

	if ( is_wp_error( $user_id ) ) {
		wp_die( 'Error Code 5: ' . esc_attr( get_option( 'mo_registration_error_message' ) ) );
	}

	$session_values = array(
		'username'        => $user_name,
		'user_email'      => $user_email,
		'user_full_name'  => $user_full_name,
		'first_name'      => $first_name,
		'last_name'       => $last_name,
		'user_url'        => $user_url,
		'user_picture'    => $user_picture,
		'social_app_name' => $appname,
		'social_user_id'  => $social_user_id,
	);

	mo_discord_start_session_login( $session_values );
	$user = get_user_by( 'id', $user_id );
	// registration hook.
	do_action( 'mo_user_register', $user_id, $user_profile_url );
	mo_discord_link_account( $user->user_login, $user );
	$linked_email_id = $wpdb->get_var( $wpdb->prepare( 'SELECT user_id FROM ' . $wpdb->prefix . 'mo_discord_linked_user where linked_social_app = %s AND identifier = %s', $appname, $social_user_id ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
	mo_discord_login_user( $linked_email_id, $user_id, $user, $user_picture, 0 );
}

/**
 * Plugin update
 *
 * @return void
 */
function mo_discord_plugin_update() {
	global $wpdb;
	$table_name      = $wpdb->prefix . 'mo_discord_linked_user';
	$charset_collate = $wpdb->get_charset_collate();

	$time = $wpdb->get_var(//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
		"SELECT COLUMN_NAME 
	FROM information_schema.COLUMNS 
	WHERE
	 TABLE_SCHEMA='$wpdb->dbname'
	 AND COLUMN_NAME = 'timestamp'"
	);

	$data_type = $wpdb->get_var( $wpdb->prepare( "SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$wpdb->dbname' AND TABLE_NAME = %s AND COLUMN_NAME = 'user_id'", $table_name ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.

	if ( 'mediumint' === $data_type ) {
		$wpdb->get_var( $wpdb->prepare( 'ALTER TABLE %s CHANGE `user_id` `user_id` BIGINT(20) NOT NULL', $table_name ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.SchemaChange -- Fetching data from a custom table and not repeating the same query hence not required caching.

	}
	if ( $wpdb->get_var( $wpdb->prepare( 'show tables like %s', $table_name ) ) !== $table_name || empty( $time ) ) {//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
		//phpcs:ignore -- not changing the schema of default tables.
		$sql = "CREATE TABLE $table_name (                        
                    id mediumint(9) NOT NULL AUTO_INCREMENT,
                    linked_social_app varchar(55) NOT NULL,
                    linked_email varchar(55) NOT NULL,
                    user_id BIGINT(20) NOT NULL,
                    identifier VARCHAR(100) NOT NULL,
                    timestamp datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
                    PRIMARY KEY  (id)
                ) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		$identifier = $wpdb->get_var( $wpdb->prepare( "SELECT COLUMN_NAME  FROM information_schema.COLUMNS WHERE TABLE_NAME = %s AND TABLE_SCHEMA= %s AND COLUMN_NAME = 'identifier'", $table_name, $wpdb->dbname ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
		if ( strcasecmp( $identifier, 'identifier' ) === 0 ) {

			$count  = $wpdb->get_var( $wpdb->prepare( "SELECT count(ID) FROM %s WHERE identifier IS NOT NULL AND identifier != ''", $wpdb->users ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
			$result = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM %s WHERE identifier IS NOT NULL AND identifier != ''", $wpdb->users ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.

			for ( $icnt = 0; $icnt < $count; ++$icnt ) {

				$provider       = $result[ $icnt ]->provider;
				$split_app_name = explode( '_', $provider );
				$provider       = esc_attr( strtolower( $split_app_name[0] ) );
				$user_email     = esc_attr( $result[ $icnt ]->user_email );
				$id             = esc_attr( $result[ $icnt ]->ID );
				$identifier     = esc_attr( $result[ $icnt ]->identifier );

				$output = $wpdb->insert(//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
					$table_name,
					array(
						'linked_social_app' => $provider,
						'linked_email'      => $user_email,
						'user_id'           => $id,
						'identifier'        => $identifier,
					),
					array(
						'%s',
						'%s',
						'%d',
						'%s',
					)
				);
				if ( false === $output ) {
					$wpdb->show_errors();
					$wpdb->print_error();
					wp_die( 'Error in insert Query' );
					exit;

				}
			}
			$wpdb->get_var( $wpdb->prepare( 'ALTER TABLE %s DROP COLUMN provider', $wpdb->users ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.SchemaChange -- Fetching data from a custom table and not repeating the same query hence not required caching.
			$wpdb->get_var( $wpdb->prepare( 'ALTER TABLE %s DROP COLUMN identifier', $wpdb->users ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.SchemaChange -- Fetching data from a custom table and not repeating the same query hence not required caching.
		}
	}

	$current_version = get_option( 'mo_discord_integrator_version' );

	if ( ! $current_version && version_compare( MO_DISCORD_INTEGRATOR_VERSION, '200.1.1', '>=' ) ) {
		$result = $wpdb->query(//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table and not repeating the same query hence not required caching.
			$wpdb->prepare(
				'
                        DELETE FROM %s
                        WHERE linked_social_app = %s
                        OR linked_email = %s
                        OR user_id = %d
                        OR identifier = %s
                        ',
				$table_name,
				'',
				'',
				0,
				''
			)
		);
		if ( false === $result ) {
			wp_die( 'Error in deletion query' );
		}
	}
	update_option( 'mo_discord_integrator_version', MO_DISCORD_INTEGRATOR_VERSION );
}
/**
 * Verify password page.
 *
 * @return void
 */
function mo_discord_show_verify_password_page() {
	update_option( 'regi_pop_up', 'no' );
	?>
	<!--Verify password with miniOrange-->
	<form name="f" method="post" action="">
		<input type="hidden" name="option" value="mo_discord_connect_verify_customer" />
		<input type="hidden" name="mo_discord_connect_verify_nonce"
			value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-connect-verify-nonce' ) ); ?>"/>
		<div class="mo_discord_table_layout">
			<h3>Login with miniOrange</h3>
			<p><b>It seems you already have an account with miniOrange. Please enter your miniOrange email and password. <a href="#forgot_password">Click here if you forgot your password?</a></b></p>
			<table class="mo_discord_settings_table">
				<tr>
					<td><b><font color="#FF0000">*</font>Email:</b></td>
					<td><input class="mo_discord_table_textbox" id="email" type="email" name="email"
							required placeholder="person@example.com"
							value="<?php echo esc_attr( get_option( 'mo_discord_admin_email' ) ); ?>" /></td>
				</tr>
				<td><b><font color="#FF0000">*</font>Password:</b></td>
				<td><input class="mo_discord_table_textbox" required type="password"
						name="password" placeholder="Choose your password" /></td>
				</tr>
				<tr>
					<td>&nbsp;</td>
					<td><input type="submit" name="submit" value="Login"
							class="button button-primary button-large" />
						<input type="button" value="Registration Page" id="mo_discord_go_back" style="margin-left: 2%"
							class="button button-primary button-large" />
					</td>
				</tr>
			</table>
		</div>
	</form>
	<form name="f" method="post" action="" id="discordgobackform">
		<input type="hidden" name="option" value="mo_discord_go_back_login"/>
		<input type="hidden" name="mo_discord_go_back_login_nonce"
			value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-go-back-login-nonce' ) ); ?>"/>
	</form>
	<form name="forgotpassword" method="post" action="" id="discordforgotpasswordform">
		<input type="hidden" name="option" value="mo_discord_forgot_password"/>
		<input type="hidden" name="mo_discord_forgot_password_nonce"
			value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-forgot-password-nonce' ) ); ?>"/>
		<input type="hidden" id="forgot_pass_email" name="email" value=""/>
	</form>
	<script>
		jQuery('#mo_discord_go_back').click(function() {
			jQuery('#discordgobackform').submit();
		});
		jQuery('a[href="#forgot_password"]').click(function(){
			jQuery('#forgot_pass_email').val(jQuery('#email').val());
			jQuery('#discordforgotpasswordform').submit();
		});
	</script>
		<?php
}

/**
 * Is discord registred
 *
 * @return int
 */
function mo_discord_is_customer_registered() {
	$email        = get_option( 'mo_discord_admin_email' );
	$customer_key = get_option( 'mo_discord_admin_customer_key' );
	if ( '253560' === $customer_key ) {
		$customer_key = '';
	}
	if ( ! $email || ! $customer_key || ! is_numeric( trim( $customer_key ) ) ) {
		return 0;
	} else {
		return 1;
	}
}

/**
 * Check empty or null.
 *
 * @param [mixed] $value value.
 * @return boolean
 */
function mo_discord_check_empty_or_null( $value ) {
	if ( ! isset( $value ) || empty( $value ) ) {
		return true;
	}
	return false;
}

/**
 * Show success message.
 *
 * @return void
 */
function mo_discord_show_success_message() {
	remove_action( 'admin_notices', 'mo_discord_success_message' );
	add_action( 'admin_notices', 'mo_discord_error_message' );
}

/**
 * Show error message.
 *
 * @return void
 */
function mo_discord_show_error_message() {
	remove_action( 'admin_notices', 'mo_discord_error_message' );
	add_action( 'admin_notices', 'mo_discord_success_message' );
}

/**
 * Success message
 *
 * @return void
 */
function mo_discord_success_message() {
	$message = get_option( 'mo_discord_message' );
	?>
	<div id="snackbar"><?php echo( esc_attr( $message ) ); ?></div>
	<style>
		#snackbar {
			visibility: hidden;
			min-width: 250px;
			margin-left: -125px;
			background-color: #c02f2f;
			color: #fff;
			text-align: center;
			border-radius: 2px;
			padding: 16px;
			position: fixed;
			z-index: 1;
			top: 8%;
			right: 30px;
			font-size: 17px;
		}

		#snackbar.show {
			visibility: visible;
			-webkit-animation: fadein 0.5s, fadeout 0.5s 3.5s;
			animation: fadein 0.5s, fadeout 0.5s 3.5s;
		}

		@-webkit-keyframes fadein {
			from {right: 0; opacity: 0;}
			to {right: 30px; opacity: 1;}
		}

		@keyframes fadein {
			from {right: 0; opacity: 0;}
			to {right: 30px; opacity: 1;}
		}

		@-webkit-keyframes fadeout {
			from {right: 30px; opacity: 1;}
			to {right: 0; opacity: 0;}
		}

		@keyframes fadeout {
			from {right: 30px; opacity: 1;}
			to {right: 0; opacity: 0;}
		}
	</style>
	<script>
		var x = document.getElementById("snackbar");
		x.className = "show";
		setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
	</script>
		<?php
}

/**
 * Error message.
 *
 * @return void
 */
function mo_discord_error_message() {
	$message = get_option( 'mo_discord_message' );
	?>
	<div id="snackbar"><?php echo( esc_attr( $message ) ); ?></div>
	<style>
		#snackbar {
			visibility: hidden;
			min-width: 250px;
			margin-left: -125px;
			background-color: #4CAF50;
			color: #fff;
			text-align: center;
			border-radius: 2px;
			padding: 16px;
			position: fixed;
			z-index: 1;
			top: 8%;
			right: 30px;
			font-size: 17px;
		}

		#snackbar.show {
			visibility: visible;
			-webkit-animation: fadein 0.5s, fadeout 0.5s 3.5s;
			animation: fadein 0.5s, fadeout 0.5s 3.5s;
		}

		@-webkit-keyframes fadein {
			from {right: 0; opacity: 0;}
			to {right: 30px; opacity: 1;}
		}

		@keyframes fadein {
			from {right: 0; opacity: 0;}
			to {right: 30px; opacity: 1;}
		}

		@-webkit-keyframes fadeout {
			from {right: 30px; opacity: 1;}
			to {right: 0; opacity: 0;}
		}

		@keyframes fadeout {
			from {right: 30px; opacity: 1;}
			to {right: 0; opacity: 0;}
		}
	</style>
	<script>

		var x = document.getElementById("snackbar");
		x.className = "show";
		setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);

	</script>
		<?php
}

/**
 * Registration model.
 *
 * @return void
 */
function mo_discord_registeration_modal() {
	update_option( 'regi_pop_up', 'yes' );
	update_option( 'mo_discord_new_registration', 'true' );

	$current_user = wp_get_current_user();
	?>
	<div id="request_registeration" class="mo_discord_modal" style="height:100%">
	<!-- Modal content -->
	<div class="mo_discord_modal-content" style="text-align:center;margin-left: 32%;margin-top: 4%;width: 37%;">
		<div class="modal-head">
			<a href="" class="mo_close" id="mo_close" style="text-decoration:none;margin-top: 3%;">&times;</a>
			<h1>Save As</h1>
		</div>
		<br>
		<span id="msg1" style="text-align: center;color: #56b11e">
	<?php
	echo esc_attr( get_option( 'pop_regi_msg' ) );
	update_option( 'pop_regi_msg', 'Your settings are saved successfully. Please enter your valid email address and enter a password to get touch with our support team.' );
	?>
		</span>
		<br>
		<br>
		<br>
		<div id="mo_saml_show_registeration_modal" >

			<!--Register with miniOrange-->

			<form name="f" method="post" action="" id="pop-register-form">
				<input name="option" value="mo_discord_connect_register_customer" type="hidden"/>
				<input type="hidden" name="mo_discord_connect_register_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-connect-register-nonce' ) ); ?>"/>
				<div>
					<table style="text-align: left;width: 100%">
						<tbody><tr>
							<td><b><font color="#FF0000">*</font>Email:</b></td>
							<td><input class="mo_discord_table_textbox" name="email" style="width: 100%"
								required placeholder="person@example.com"
								value="<?php echo esc_attr( $current_user->user_email ); ?>" type="email" />
							</td>
						</tr>

						<tr>
							<td><b><font color="#FF0000">*</font>Password:</b></td>
							<td><input class="mo_discord_table_textbox" required name="password"
								style="width: 100%" placeholder="Choose your password (Min. length 6)"
								type="password" /></td>
						</tr>
						<tr id="pop_register" >
							<td><b><font color="#FF0000">*</font>Confirm Password:</b></td>
							<td><input class="mo_discord_table_textbox" required name="confirmPassword"
								style="width: 100%" placeholder="Confirm your password"
								type="password" /></td>
						</tr>

						</tbody></table>
					<br><br>
					<input value="Submit" id="register_submit" style="margin-right: 28%;" class="button button-primary button-large" type="submit">

				</div>
			</form>
			<form method="post">

				<input id="pop_next" name="show_login" value="Existing Account" class="button button-primary button-large" style="margin-left: 35%;margin-top: -7.7%;" type="submit">

			</form>



		</div>
	</div>

	</div>

		<?php
}

/**
 * Create Discord customer.
 *
 * @param [mixed]  $action action.
 * @param [string] $password password.
 * @return void
 */
function create_dis_customer( $action, $password ) {
	$check_post   = isset( $action ) ? sanitize_text_field( $action ) : '';
	$customer     = new MoCustomerDiscordverification();
	$customer_key = json_decode( $customer->create_dis_customer( $action, $password ), true );
	if ( strcasecmp( $customer_key['status'], 'CUSTOMER_USERNAME_ALREADY_EXISTS' ) === 0 ) {
		get_current_discord_customer( $action, $password );
	} elseif ( ( strcasecmp( $customer_key['status'], 'INVALID_EMAIL_QUICK_EMAIL' ) === 0 ) && ( strcasecmp( $customer_key['message'], 'This is not a valid email. please enter a valid email.' ) === 0 ) ) {
		if ( 'mo_register_new_user' === $check_post ) {
			wp_send_json( array( 'error' => 'There was an error creating an account for you. You may have entered an invalid Email-Id. (We discourage the use of disposable emails) Please try again with a valid email.' ) );
		} else {
			update_option( 'mo_discord_message', 'There was an error creating an account for you. You may have entered an invalid Email-Id. <b> (We discourage the use of disposable emails) </b> Please try again with a valid email.' );
			update_option( 'mo_discord_registration_status', 'EMAIL_IS_NOT_VALID' );
			mo_discord_show_error_message();
			if ( get_option( 'regi_pop_up' ) === 'yes' ) {
				update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
				mo_discord_registeration_modal();
			}
		}
	} elseif ( ( strcasecmp( $customer_key['status'], 'FAILED' ) === 0 ) && ( strcasecmp( $customer_key['message'], 'Email is not enterprise email.' ) === 0 ) ) {
		if ( 'mo_register_new_user' === $check_post ) {
			wp_send_json( array( 'error' => 'There was an error creating an account for you. You may have entered an invalid Email-Id. (We discourage the use of disposable emails) Please try again with a valid email.' ) );
		} else {
			update_option( 'mo_discord_message', 'There was an error creating an account for you. You may have entered an invalid Email-Id. <b> (We discourage the use of disposable emails) </b> Please try again with a valid email.' );
			update_option( 'mo_discord_registration_status', 'EMAIL_IS_NOT_ENTERPRISE' );
			mo_discord_show_error_message();
			if ( get_option( 'regi_pop_up' ) === 'yes' ) {
				update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
				mo_discord_registeration_modal();
			}
		}
	} elseif ( strcasecmp( $customer_key['status'], 'SUCCESS' ) === 0 ) {
		update_option( 'mo_discord_admin_customer_key', $customer_key['id'] );
		update_option( 'mo_discord_admin_api_key', $customer_key['apiKey'] );
		update_option( 'mo_discord_customer_token', $customer_key['token'] );
		update_option( 'mo_discord_cust', '0' );
		update_option( 'mo_discord_message', 'Registration complete!' );
		update_option( 'mo_discord_registration_status', 'MO_DISCORD_REGISTRATION_COMPLETE' );
		delete_option( 'mo_discord_verify_customer' );
		delete_option( 'mo_discord_new_registration' );
		if ( 'mo_register_new_user' === $check_post ) {
			wp_send_json( array( 'success' => 'Registration complete!' ) );
		} else {
			mo_discord_show_success_message();
			header( 'Location: admin.php?page=mo_discord_settings&tab=licensing_plans' );
		}
	}
}

/**
 * Register user.
 *
 * @param [string] $action action.
 * @param [string] $email email.
 * @param [string] $password password.
 * @param [string] $confirm_password confirm password.
 * @return void
 */
function mo_discord_register_user( $action, $email, $password, $confirm_password ) {
	$illegal = "#$%^*()+=[]';,/{}|:<>?~";
	$illegal = $illegal . '"';
	if ( mo_discord_check_empty_or_null( sanitize_email( $email ) ) || mo_discord_check_empty_or_null( $password ) || mo_discord_check_empty_or_null( $confirm_password ) ) {
		update_option( 'mo_discord_message', 'All the fields are required. Please enter valid entries.' );
		mo_discord_show_error_message();
		if ( get_option( 'regi_pop_up' ) === 'yes' ) {
			update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
			mo_discord_registeration_modal();
		}
		return;
	} elseif ( strlen( $password ) < 6 || strlen( $confirm_password ) < 6 ) {
		update_option( 'mo_discord_message', 'Choose a password with minimum length 6.' );
		mo_discord_show_error_message();
		if ( get_option( 'regi_pop_up' ) === 'yes' ) {
			update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
			mo_discord_registeration_modal();
		}
		return;
	} elseif ( strpbrk( $email, $illegal ) ) {
		update_option( 'mo_discord_message', 'Please match the format of Email. No special characters are allowed.' );
		mo_discord_show_error_message();
		if ( get_option( 'regi_pop_up' ) === 'yes' ) {
			update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
			mo_discord_registeration_modal();
		}
		return;
	} elseif ( strcmp( stripslashes( $password ), stripslashes( $confirm_password ) ) !== 0 ) {
		update_option( 'mo_discord_message', 'Passwords do not match.' );
		if ( get_option( 'regi_pop_up' ) === 'yes' ) {
			update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
			mo_discord_registeration_modal();
		}
		delete_option( 'mo_discord_verify_customer' );
		mo_discord_show_error_message();
	} else {
		$email    = sanitize_email( $email );
		$password = stripslashes( $password );
		update_option( 'mo_discord_admin_email', $email );
		$customer = new MoCustomerDiscordverification();
		$content  = json_decode( $customer->check_dis_customer(), true );
		if ( strcasecmp( $content['status'], 'CUSTOMER_NOT_FOUND' ) === 0 ) {
			if ( 'ERROR' === $content['status'] ) {
				if ( 'mo_register_new_user' === $action ) {
					wp_send_json( array( 'error' => $content['message'] ) );
				} else {
					update_option( 'mo_discord_message', $content['message'] );
					mo_discord_show_error_message();
				}
			} else {
				create_dis_customer( $action, $password );
				update_option( 'mo_discord_new_user', '1' );
				update_option( 'mo_discord_malform_error', '1' );
			}
		} elseif ( null === $content ) {
			if ( 'mo_register_new_user' === $action ) {
				wp_send_json( array( 'error' => 'Please check your internet connetion and try again.' ) );
			} else {
				update_option( 'mo_discord_message', 'Please check your internet connetion and try again.' );
				mo_discord_show_error_message();
				if ( get_option( 'regi_pop_up' ) === 'yes' ) {
					update_option( 'pop_regi_msg', get_option( 'mo_discord_message' ) );
					mo_discord_registeration_modal();
				}
			}
		} else {
			get_current_discord_customer( $action, $password );
		}
	}

}

/**
 * Register old use
 *
 * @param [string] $action action.
 * @param [string] $email email.
 * @param [string] $password password.
 * @return void
 */
function mo_discord_register_old_user( $action, $email, $password ) {
	// validation and sanitization.
	$illegal = "#$%^*()+=[]';,/{}|:<>?~";
	$illegal = $illegal . '"';
	if ( mo_discord_check_empty_or_null( $email ) || mo_discord_check_empty_or_null( $password ) ) {
		update_option( 'mo_discord_message', 'All the fields are required. Please enter valid entries.' );
		mo_discord_show_error_message();
		return;
	} elseif ( strpbrk( $email, $illegal ) ) {
		update_option( 'mo_discord_message', 'Please match the format of Email. No special characters are allowed.' );
		mo_discord_show_error_message();
		return;
	} else {
		$email    = sanitize_email( $email );
		$password = stripslashes( $password );
	}
	update_option( 'mo_discord_admin_email', $email );
	$customer     = new MoCustomerDiscordverification();
	$content      = $customer->get_dis_customer_key( $password );
	$customer_key = json_decode( $content, true );
	$phone        = isset( $customer_key['phone'] ) ? $customer_key['phone'] : '';
	if ( isset( $customer_key ) ) {
		update_option( 'mo_discord_admin_customer_key', $customer_key['id'] );
		update_option( 'mo_discord_admin_api_key', $customer_key['apiKey'] );
		update_option( 'mo_discord_customer_token', $customer_key['token'] );
		update_option( 'mo_discord_admin_phone', $phone );
		update_option( 'mo_discord_message', 'Your account has been retrieved successfully.' );
		delete_option( 'mo_discord_verify_customer' );
		if ( isset( $action ) ? sanitize_text_field( $action ) === 'mo_discord_register_old_user' : false ) {
			wp_send_json( array( 'success' => 'Your account has been retrieved successfully.' ) );
		} else {
			mo_discord_show_success_message();
		}
	} else {
		if ( isset( $action ) ? sanitize_text_field( $action ) === 'mo_discord_register_old_user' : false ) {
			wp_send_json( array( 'error' => 'Invalid username or password. Please try again.' ) );
		} else {
			update_option( 'mo_discord_message', 'Invalid username or password. Please try again.' );
			mo_discord_show_error_message();
		}
	}
}



/**
 * Activation message.
 *
 * @return void
 */
function mo_discord_activation_message() {
	$message = get_option( 'mo_discord_message' );
	echo "<div class='updated'> <p>" . wp_kses_data( $message ) . '</p></div>';
}



