<?php //phpcs:ignore WordPress.Files.FileName.NotHyphenatedLowercase -- Not changing file name because this is the main plugin file, and changing this would lead to deacivation of plugin for the active users.
/**
 * Plugin Name: miniOrange Discord Integration
 * Plugin URI: https://www.miniorange.com
 * Description: Allow your users to Log in with Discord using customizable buttons and map their profile attributes with WordPress
 * Version: 2.2.1
 * Author: miniOrange
 * License: MIT/Expat
 * License URI: https://docs.miniorange.com/mit-license
 *
 * @package MO_DISCORD_INTEGRATOR
 */

define( 'MO_DISCORD_INTEGRATOR_VERSION', '2.2.1' );
define( 'MO_DISCORD_PLUGIN_URL', plugin_dir_url( __FILE__ ) . 'includes/images/icons/' );
define( 'MOSL_DISCORD_PLUGIN_DIR', str_replace( '/', '\\', plugin_dir_path( __FILE__ ) ) );
require 'miniorange-discord-sso-settings-page.php';
require 'view/config_apps/mo-discord-config-apps-funct.php';
require 'view/profile/mo-discord-profile.php';
require dirname( __FILE__ ) . '/mo-discord-feedback-form.php';
require_once dirname( __FILE__ ) . '/class-mo-discord-login-wid.php';

/**
 * Discord Setting control.
 */
class Miniorange_Discord_Sso_Settings {
	/**
	 * Constructor.
	 */
	public function __construct() {
		register_activation_hook( __FILE__, array( $this, 'mo_discord_activate' ) );
		register_deactivation_hook( __FILE__, array( $this, 'mo_discord_deactivate' ) );

		add_action( 'admin_menu', array( $this, 'new_miniorange_discord_menu' ) );
		add_action( 'admin_init', array( $this, 'miniorange_discord_save_settings' ) );
		add_action( 'init', 'mo_discord_login_validate' );
		add_action( 'admin_init', 'mo_discord_plugin_update', 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'mo_discord_plugin_settings_script' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'mo_discord_plugin_settings_admin_style' ) );
		add_action( 'wp_ajax_mo_discord_capp_details', 'mo_discord_capp_details_action' );
		add_action( 'wp_ajax_mo_discord_capp_delete', 'mo_discord_capp_delete' );
		add_action( 'wp_ajax_mo_discord_test_configuration_update', 'mo_discord_test_configuration_update_action' );
		add_action( 'wp_ajax_mo_register_customer_toggle_update', 'mo_discord_register_customer_toggle_update' );
		add_action( 'wp_ajax_mo_discord_disable_app', 'mo_discord_disable_app' );
		add_action( 'admin_footer', array( $this, 'mo_discord_feedback_request' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'mo_discord_plugin_script' ), 5 );

		// add shortcode.
		add_shortcode( 'miniorange_discord_login', array( $this, 'mo_discord_get_output' ) );

		// set default values.
		add_option( 'mo_discord_integrator_host_name', 'https://login.xecurify.com' );
		if ( get_option( 'mo_discord_admin_customer_key' ) === '' || get_option( 'mo_discord_admin_email' ) === '' ) {
			update_option( 'mo_discord_admin_api_key', 'AlLYedZwuoITn6nVHVUps0r9OMZxVolX' );
			update_option( 'mo_discord_customer_token', 'jMj7MEdu4wkHObiD' );
			update_option( 'mo_discord_admin_customer_key', '253560' );
		}
		add_option( 'app_pos', 'discord' );
		add_option( 'mo_default_role', 'Subscriber' );

		add_option( 'mo_discord_default_login_enable', 1 );
		add_option( 'mo_discord_default_register_enable', 1 );
		add_option( 'mo_discord_login_theme', 'longbutton' );

		add_option( 'mo_login_icon_space', '4' );
		add_option( 'mo_login_icon_custom_width', '200' );
		add_option( 'mo_login_icon_custom_height', '35' );
		add_option( 'mo_login_icon_custom_size', '35' );
		add_option( 'mo_login_icon_custom_color', '2B41FF' );
		add_option( 'mo_discord_login_custom_theme', 'default' );
		add_option( 'mo_discord_login_button_customize_text', 'Login with' );
		add_option( 'mo_login_icon_custom_boundary', '4' );
		add_option( 'mo_discord_login_widget_customize_logout_name_text', 'Howdy, ##username## |' );
		add_option( 'mo_discord_login_widget_customize_logout_text', 'Logout?' );
		add_option( 'mo_login_discord_login_widget_customize_textcolor', '000000' );
		add_option( 'mo_discord_login_widget_customize_text', 'Connect with' );
		add_option( 'mo_discord_social_login_avatar', '1' );
		add_option( 'mo_discord_deactivate_reason_form', '0' );
		add_option( 'mo_discord_user_activation_date', '0' );
		add_option( 'mo_discord_login_app', '0' );
		add_option( 'mo_discord_login_field_option', array( 'id', 'username', 'email', 'avatar', 'discriminator', 'public_flags', 'flags', 'banner', 'banner_color', 'accent_color', 'locale', 'verified', 'mfa_enabled' ) );

		// font awesome and bootstrap.
		add_option( 'mo_discord_fonawesome_load', '1' );
		add_option( 'mo_discord_bootstrap_load', '1' );

		add_option( 'mo_discord_login_theme', 'default' );

		// attribute mapping.
		add_option( 'mo_discord_attr_email', 'email' );
		add_option( 'mo_discord_attr_username', 'username' );
		add_option( 'mo_discord_attr_display_name', 'username' );

		// add social login icons to default login form.
		if ( get_option( 'mo_discord_default_login_enable' ) === '1' ) {
			add_action( 'login_form', array( $this, 'mo_discord_add_social_login' ) );
		}

		// add social login icons to default registration form.
		if ( get_option( 'mo_discord_default_register_enable' ) === '1' ) {
			add_action( 'register_form', array( $this, 'mo_discord_add_social_login' ) );
		}
		if ( get_option( 'mo_discord_social_login_avatar' ) ) {
			add_filter( 'get_avatar', array( $this, 'mo_discord_login_custom_avatar' ), 15, 5 );
			add_filter( 'get_avatar_url', array( $this, 'mo_discord_login_custom_avatar_url' ), 15, 3 );
		}
		// Error messages options.
		add_option( 'mo_registration_error_message', 'There was an error in registration. Please contact your administrator.' );
		add_option( 'mo_existing_username_error_message', 'This username already exists. Please ask the administrator to create your account with a unique username.' );
		add_option( 'mo_delete_user_error_message', 'Error deleting user from account linking table' );
	}
	/**
	 * Enque Scripts
	 *
	 * @return void
	 */
	public function mo_discord_plugin_settings_script() {
		$version = get_option( 'mo_discord_integrator_version' );
		if ( strpos( get_current_screen()->id, 'toplevel_page' ) === false ) {
			return;
		}
		wp_enqueue_script( 'mo_discord_admin_settings_phone_script', plugins_url( 'includes/js/mo_discord_phone.js', __FILE__ ), array(), $version, 'all' );
	}
	/**
	 * Discord plugin style
	 *
	 * @return void
	 */
	public function mo_discord_plugin_settings_admin_style() {
		$version = get_option( 'mo_discord_integrator_version' );
		if ( strpos( get_current_screen()->id, 'toplevel_page' ) === false ) {
			return;
		}
		wp_enqueue_style( 'mo-wp-bootstrap-social', plugins_url( 'includes/css/bootstrap-discord.min.css', __FILE__ ), false, $version );
		if ( get_option( 'mo_discord_bootstrap_load' ) === '1' ) {
			wp_enqueue_style( 'mo-wp-bootstrap-main', plugins_url( 'includes/css/bootstrap.min-preview.min.css', __FILE__ ), false, $version );
		}
		wp_enqueue_style( 'mo-wp-style-icon', plugins_url( 'includes/css/mo_discord_login_icons.min.css', __FILE__ ), false, $version );
		if ( get_option( 'mo_discord_fonawesome_load' ) === '1' ) {
			wp_enqueue_style( 'mo-discord-sl-wp-font-awesome', plugins_url( 'includes/css/mo-font-awesome.min.css', __FILE__ ), false, $version );
		}
		wp_enqueue_style( 'mo_discord_admin_settings_style', plugins_url( 'includes/css/mo_discord_style.min.css', __FILE__ ), array(), $version );
		wp_enqueue_style( 'mo_discord_admin_settings_phone_style', plugins_url( 'includes/css/phone.min.css', __FILE__ ), array(), $version );
	}
	/**
	 * Discord Activate.
	 *
	 * @return void
	 */
	public function mo_discord_activate() {
		$user_activation_date  = gmdate( 'Y-m-d', strtotime( ' + 10 days' ) );
		$user_activation_date1 = gmdate( 'Y-m-d' );
		update_option( 'mo_discord_user_activation_date1', $user_activation_date1 );
		update_option( 'mo_discord_user_activation_date', $user_activation_date );
		add_option( 'mo_discord_malform_error', '1' );
		add_option( 'Activated_Plugin', 'Plugin-Slug' );
		update_option( 'mo_discord_integrator_host_name', 'https://login.xecurify.com' );

	}
	/**
	 * Disocrd Menu
	 *
	 * @return void
	 */
	public function new_miniorange_discord_menu() {
		// Add miniOrange plugin to the menu.
		$page = add_menu_page(
			'MO Discord Settings ' . __( 'Configure Discord', 'mo_discord_settings' ),
			'Discord Integration',
			'administrator',
			'mo_discord_settings',
			'mo_register_discord',
			plugin_dir_url( __FILE__ ) . 'includes/images/miniorange_icon.png'
		);
	}
	/**
	 * Mo discord add social login.
	 *
	 * @return void
	 */
	public function mo_discord_add_social_login() {

		add_action( 'wp_enqueue_scripts', array( $this, 'mo_discord_plugin_script' ), 5 );
		if ( ! is_user_logged_in() && strpos( isset( $_SERVER['QUERY_STRING'] ) ? sanitize_text_field( wp_unslash( $_SERVER['QUERY_STRING'] ) ) : '', 'disable-social-login' ) === false ) {
			$mo_login_widget = new Mo_Discord_Login_Wid();
			$mo_login_widget->discordloginForm();
		}
	}

	/**
	 * Enque scripts.
	 *
	 * @return void
	 */
	public function mo_discord_plugin_script() {
		$version = get_option( 'mo_discord_integrator_version' );
		wp_enqueue_script( 'mo-social-login-script', plugins_url( 'includes/js/mo-discord-social_login.min.js', __FILE__ ), array( 'jquery' ), $version, false );
	}
	/**
	 * Save Configured Settings.
	 *
	 * @return void
	 */
	public function miniorange_discord_save_settings() {
		if ( is_admin() && get_option( 'Activated_Plugin' ) === 'Plugin-Slug' ) {
			delete_option( 'Activated_Plugin' );
			update_option( 'mo_discord_message', 'Go to plugin <b><a href="admin.php?page=mo_discord_settings">settings</a></b> to enable WordPress Discord Integration by miniOrange.' );
			add_action( 'admin_notices', 'mo_discord_activation_message' );
		}

		$value = isset( $_POST['option'] ) ? sanitize_text_field( wp_unslash( $_POST['option'] ) ) : '';
		switch ( $value ) {
			case 'mo_discord_customise_social_icons':
				$nonce = isset( $_POST['mo_discord_customise_social_icons_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_customise_social_icons_nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'mo-discord-customise-social-icons-nonce' ) ) {
					wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
				} elseif ( current_user_can( 'administrator' ) ) {
					update_option( 'mo_discord_fonawesome_load', isset( $_POST['mo_discord_fonawesome_load'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_fonawesome_load'] ) ) : 0 );
					update_option( 'mo_discord_bootstrap_load', isset( $_POST['mo_discord_bootstrap_load'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_bootstrap_load'] ) ) : 0 );
					update_option( 'mo_discord_login_theme', isset( $_POST['mo_discord_login_theme'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_login_theme'] ) ) : '' );
					update_option( 'mo_discord_login_custom_theme', isset( $_POST['mo_discord_login_custom_theme'] ) ? 'default' : '' );
					update_option( 'mo_login_icon_custom_color', isset( $_POST['mo_login_icon_custom_color'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_login_icon_custom_color'] ) ) : '' );
					update_option( 'mo_login_icon_space', isset( $_POST['mo_login_icon_space'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_login_icon_space'] ) ) : '' );
					update_option( 'mo_login_icon_custom_width', isset( $_POST['mo_login_icon_custom_width'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_login_icon_custom_width'] ) ) : '' );
					update_option( 'mo_login_icon_custom_height', isset( $_POST['mo_login_icon_custom_height'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_login_icon_custom_height'] ) ) : '' );
					update_option( 'mo_login_icon_custom_boundary', isset( $_POST['mo_login_icon_custom_boundary'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_login_icon_custom_boundary'] ) ) : '' );
					update_option( 'mo_login_icon_custom_size', isset( $_POST['mo_login_icon_custom_size'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_login_icon_custom_size'] ) ) : '' );
					update_option( 'mo_login_discord_login_widget_customize_textcolor', isset( $_POST['mo_login_discord_login_widget_customize_textcolor'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_login_discord_login_widget_customize_textcolor'] ) ) : '' );
					update_option( 'mo_discord_login_widget_customize_text', isset( $_POST['mo_discord_login_widget_customize_text'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_login_widget_customize_text'] ) ) : '' );
					update_option( 'mo_discord_login_button_customize_text', isset( $_POST['mo_discord_login_button_customize_text'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_login_button_customize_text'] ) ) : '' );
					update_option( 'mo_discord_login_widget_customize_logout_name_text', isset( $_POST['mo_discord_login_widget_customize_logout_name_text'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_login_widget_customize_logout_name_text'] ) ) : '' );
					update_option( 'mo_discord_login_widget_customize_logout_text', isset( $_POST['mo_discord_login_widget_customize_logout_text'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_login_widget_customize_logout_text'] ) ) : '' );
					update_option( 'mo_discord_default_login_enable', isset( $_POST['mo_discord_default_login_enable'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_default_login_enable'] ) ) : 0 );
					update_option( 'mo_discord_default_register_enable', isset( $_POST['mo_discord_default_register_enable'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_default_register_enable'] ) ) : 0 );
					update_option( 'mo_discord_message', 'Your settings are saved successfully.' );
					mo_discord_show_success_message();
				}
				break;
			case 'mo_discord_enable_attribute_mapping':
				$nonce = isset( $_POST['mo_discord_enable_attribute_mapping_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_enable_attribute_mapping_nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'mo-discord-enable-discord-restriction-nonce' ) ) {
					wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
				} elseif ( current_user_can( 'administrator' ) ) {
					update_option( 'mo_discord_attr_username', isset( $_POST['mo_discord_attr_username'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_attr_username'] ) ) : 0 );
					update_option( 'mo_discord_attr_email', isset( $_POST['mo_discord_attr_email'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_attr_email'] ) ) : 0 );
					update_option( 'mo_discord_attr_fname', isset( $_POST['mo_discord_attr_fname'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_attr_fname'] ) ) : 0 );
					update_option( 'mo_discord_attr_lname', isset( $_POST['mo_discord_attr_lname'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_attr_lname'] ) ) : 0 );
					update_option( 'mo_discord_attr_display_name', isset( $_POST['mo_discord_attr_display_name'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_attr_display_name'] ) ) : 0 );
				}
				break;
			case 'mo_dis_basic_role_setting':
				$nonce = isset( $_POST['mo_dis_basic_role_setting_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_dis_basic_role_setting_nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'mo-dis-basic-role-setting-nonce' ) ) {
					wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
				} elseif ( current_user_can( 'administrator' ) ) {
					update_option( 'mo_dis_basic_role_mapping', isset( $_POST['mo_dis_basic_role_mapping'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_dis_basic_role_mapping'] ) ) : 'Subscriber' );
				}
				break;
			case 'mo_discord_enable_redirect':
				$nonce = isset( $_POST['mo_discord_enable_redirect_nonce'] ) && ! empty( $_POST['mo_discord_enable_redirect_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_enable_redirect_nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'mo-discord-enable-redirect-nonce' ) ) {
						wp_die( '<strong>ERROR WPSL15</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
				} else {
					if ( current_user_can( 'administrator' ) ) {
						// Redirect URL.
						update_option( 'mo_discord_login_redirect', isset( $_POST['mo_discord_login_redirect'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_login_redirect'] ) ) : '' );
						update_option( 'mo_discord_login_redirect_url', isset( $_POST['mo_discord_login_redirect_url'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_login_redirect_url'] ) ) : '' );
						update_option( 'mo_discord_relative_login_redirect_url', isset( $_POST['mo_discord_relative_login_redirect_url'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_relative_login_redirect_url'] ) ) : '' );

						// Logout Url.
						update_option( 'mo_discord_logout_redirection_enable', isset( $_POST['mo_discord_logout_redirection_enable'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_logout_redirection_enable'] ) ) : 0 );
						update_option( 'mo_discord_logout_redirect', isset( $_POST['mo_discord_logout_redirect'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_logout_redirect'] ) ) : '' );
						update_option( 'mo_discord_logout_redirect_url', isset( $_POST['mo_discord_logout_redirect_url'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_logout_redirect_url'] ) ) : '' );
						update_option( 'mo_discord_message', 'Your settings are saved successfully.' );
						mo_discord_show_success_message();
					}
				}
				break;
			case 'mo_discord_contact_us_query_option':
				$nonce = isset( $_POST['mo_discord_contact_us_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_contact_us_nonce'] ) ) : '';

				if ( ! wp_verify_nonce( $nonce, 'mo-discord-contact-us-nonce' ) ) {
					wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
				} elseif ( current_user_can( 'administrator' ) ) {
					$email        = isset( $_POST['mo_discord_contact_us_email'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_contact_us_email'] ) ) : '';
					$phone        = isset( $_POST['mo_discord_contact_us_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_contact_us_phone'] ) ) : '';
					$query        = isset( $_POST['mo_discord_contact_us_query'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_contact_us_query'] ) ) : '';
					$feature_plan = isset( $_POST['mo_discord_feature_plan'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_feature_plan'] ) ) : '';
					$customer     = new MoCustomerDiscordverification();
					if ( mo_discord_check_empty_or_null( $email ) || mo_discord_check_empty_or_null( $query ) ) {
						update_option( 'mo_discord_message', 'Please fill up Email and Query fields to submit your query.' );
						mo_discord_show_error_message();
					} else {
						$submited = $customer->mo_dis_submit_contact_us( $email, $phone, $query, $feature_plan );
						if ( false === $submited ) {
							update_option( 'mo_discord_message', 'Your query could not be submitted. Please try again.' );
							mo_discord_show_error_message();
						} else {
							update_option( 'mo_discord_message', 'Thanks for getting in touch! We shall get back to you shortly.' );
							mo_discord_show_success_message();
						}
					}
				}
				break;

			case 'mo_discord_feedback':
				$nonce = isset( $_POST['mo_discord_feedback_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_discord_feedback_nonce'] ) ) : '';
				if ( ! wp_verify_nonce( $nonce, 'mo-discord-feedback-nonce' ) ) {
					wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
				} elseif ( current_user_can( 'administrator' ) ) {
					$message = '';
					$email   = '';
					if ( isset( $_POST['deactivate_plugin'] ) ) {
						$message .= ' ' . sanitize_text_field( wp_unslash( $_POST['deactivate_plugin'] ) );
						if ( isset( $_POST['mo_discord_query_feedback'] ) && '' !== $_POST['mo_discord_query_feedback'] ) {
							$message .= '. ' . sanitize_text_field( wp_unslash( $_POST['mo_discord_query_feedback'] ) );
						}

						$email      = isset( $_POST['mo_feedback_email'] ) ? sanitize_text_field( wp_unslash( $_POST['mo_feedback_email'] ) ) : '';
						$phone      = '';
						$contact_us = new MoCustomerDiscordverification();
						$content    = $contact_us->mo_discord_send_email_alert( $email, $phone, $message );
						$submited   = json_decode( $content, true );

						if ( json_last_error() === JSON_ERROR_NONE ) {
							if ( is_array( $submited ) && array_key_exists( 'status', $submited ) && 'ERROR' === $submited['status'] ) {
								if ( isset( $submited['message'] ) ) {
									update_option( 'mo_discord_message', $submited['message'] );
								}
							} else {
								if ( false === $submited ) {
									update_option( 'mo_discord_message', 'ERROR_WHILE_SUBMITTING_QUERY' );
									mo_discord_show_success_message();
								} else {

									update_option( 'mo_discord_message', 'Your response is submitted successfully' );
									mo_discord_show_success_message();
								}
							}
						}
						update_option( 'mo_discord_deactivate_reason_form', '1' );
						deactivate_plugins( '/miniorange-discord-integration/miniorange_discord_sso_settings.php' );
						update_option( 'mo_discord_message', 'Plugin Deactivated Successfully' );
						mo_discord_show_success_message();
					} elseif ( isset( $_POST['submit'] ) && sanitize_text_field( wp_unslash( $_POST['submit'] ) ) === 'Skip and Deactivate' ) {
						deactivate_plugins( '/miniorange-discord-integration/miniorange_discord_sso_settings.php' );
						update_option( 'mo_discord_message', 'Plugin Deactivated Successfully' );
						mo_discord_show_success_message();
					}
				}
				break;
		}
	}
	/**
	 * Discord get output
	 *
	 * @param [array] $atts atts.
	 * @return html
	 */
	public function mo_discord_get_output( $atts ) {
		$miniorange_widget = new Mo_Discord_Login_Wid();
			$html          = $miniorange_widget->discordloginFormShortCode( $atts );
			return $html;
	}
	/**
	 * Discord deactivate.
	 *
	 * @return void
	 */
	public function mo_discord_deactivate() {
		delete_option( 'mo_discord_integrator_host_name' );
		delete_option( 'mo_discord_registration_status' );
		delete_option( 'mo_discord_admin_phone' );
		delete_option( 'mo_discord_new_registration' );
		delete_option( 'mo_discord_admin_customer_key' );
		delete_option( 'mo_discord_admin_api_key' );
		delete_option( 'mo_discord_customer_token' );
		delete_option( 'mo_discord_verify_customer' );
	}
	/**
	 * Feedback request
	 *
	 * @return void
	 */
	public function mo_discord_feedback_request() {
		if ( get_option( 'mo_discord_deactivate_reason_form' ) === '0' ) {
			mo_discord_display_feedback_form();
		}
	}
	/**
	 * Login custom avtar.
	 *
	 * @param [type] $avatar avtar.
	 * @param [type] $mixed mixed.
	 * @param [type] $size size.
	 * @param [type] $default default.
	 * @param string $alt alt.
	 * @return mixed
	 */
	public function mo_discord_login_custom_avatar( $avatar, $mixed, $size, $default, $alt = '' ) {
		if ( is_numeric( $mixed ) && $mixed > 0 ) {
			$user_id = $mixed;
		} elseif ( is_string( $mixed ) && ( get_user_by( 'email', $mixed ) ) ) {
			$user    = get_user_by( 'email', $mixed );
			$user_id = $user->ID;
		} elseif ( is_object( $mixed ) && property_exists( $mixed, 'user_id' ) && is_numeric( $mixed->user_id ) ) {       // Check if we have a user object.
			$user_id = $mixed->user_id;
		} else {
			$user_id = null;
		}

		if ( ! empty( $user_id ) ) {
			$filename = '';
			if ( ! ( is_dir( $filename ) ) ) {
				$user_meta_thumbnail = get_user_meta( $user_id, 'modiscord_user_avatar', true );
				$user_meta_name      = get_user_meta( $user_id, 'user_name', true );
				$user_picture        = ( ! empty( $user_meta_thumbnail ) ? $user_meta_thumbnail : '' );
				if ( false !== $user_picture && strlen( trim( $user_picture ) ) > 0 ) {
					return '<img alt="' . $user_meta_name . '" src="' . $user_picture . '" class="avatar apsl-avatar-social-login avatar-' . $size . ' photo" height="' . $size . '" width="' . $size . '" />';
				}
			}
		}
		return $avatar;
	}

	/**
	 * Mo_discord_login_custom_avatar_url.
	 *
	 * @param [type] $url Url.
	 * @param [type] $id_or_email ID or Email.
	 * @param [type] $args args.
	 * @return string
	 */
	public function mo_discord_login_custom_avatar_url( $url, $id_or_email, $args = null ) {

		if ( is_numeric( $id_or_email ) && $id_or_email > 0 ) {
			$user_id = $id_or_email;
		} elseif ( is_string( $id_or_email ) && get_user_by( 'email', $id_or_email ) ) {
			$user    = get_user_by( 'email', $id_or_email );
			$user_id = $user->ID;
		} elseif ( is_object( $id_or_email ) && property_exists( $id_or_email, 'user_id' ) && is_numeric( $id_or_email->user_id ) ) {
			$user_id = $id_or_email->user_id;
		} else {        // None found.
			$user_id = null;
		}

		if ( ! empty( $user_id ) ) {
			$filename = '';
			if ( ! ( is_dir( $filename ) ) ) {
				$user_meta_thumbnail = get_user_meta( $user_id, 'modiscord_user_avatar', true );
				$user_picture        = ( ! empty( $user_meta_thumbnail ) ? $user_meta_thumbnail : $url );
				return $user_picture;
			}
		}
		return $url;
	}

}

new Miniorange_Discord_Sso_Settings();
