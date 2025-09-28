<?php
/**
 * Uninstall plugin
 *
 * @package MO_DISCORD_INTEGRATOR
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit();
}
delete_option( 'mo_discord_integrator_host_name' );
delete_option( 'mo_discord_new_registration' );
delete_option( 'mo_discord_admin_company_name' );
delete_option( 'mo_discord_admin_first_name' );
delete_option( 'mo_discord_admin_last_name' );
delete_option( 'mo_discord_admin_email' );
delete_option( 'mo_discord_admin_phone' );
delete_option( 'mo_discord_verify_customer' );
delete_option( 'mo_discord_registration_status' );
delete_option( 'mo_discord_customer_token' );
delete_option( 'mo_discord_message' );
delete_option( 'mo_discord_admin_customer_key' );
delete_option( 'mo_discord_admin_api_key' );
delete_option( 'mo_discord_default_login_enable' );
delete_option( 'mo_discord_default_register_enable' );
delete_option( 'mo_discord_social_login_avatar' );
delete_option( 'mo_discord_deactivate_reason_form' );
delete_option( 'mo_discord_login_theme' );
delete_option( 'mo_discord_login_widget_customize_text' );
delete_option( 'mo_discord_login_button_customize_text' );
delete_option( 'mo_login_icon_custom_boundary' );

delete_option( 'mo_login_icon_custom_size' );
delete_option( 'mo_login_icon_space' );
delete_option( 'mo_login_icon_custom_width' );
delete_option( 'mo_login_icon_custom_height' );
delete_option( 'mo_discord_login_custom_theme' );
delete_option( 'mo_login_icon_custom_color' );

delete_option( 'mo_discord_login_widget_customize_logout_name_text' );
delete_option( 'mo_discord_login_widget_customize_logout_text' );
delete_option( 'mo_login_discord_login_widget_customize_textcolor' );

delete_option( 'mo_discord_new_user' );
delete_option( 'mo_discord_malform_error' );


// delete options.
delete_option( 'mo_discord_integrator_version' );


// error message options.
delete_option( 'mo_registration_error_message' );
delete_option( 'mo_existing_username_error_message' );
delete_option( 'mo_delete_user_error_message' );

delete_option( 'mo_discord_test_configuration' );

delete_option( 'regi_pop_up' );
delete_option( 'pop_regi_msg' );
delete_option( 'pop_login_msg' );
delete_option( 'mo_discord_feedback_form' );

delete_option( 'mo_discord_rateus_activation' );
delete_option( 'mo_discord_user_activation_date' );

delete_option( 'mo_discord_user_activation_date1' );

delete_option( 'mo_discord_bootstrap_load' );
delete_option( 'mo_discord_fonawesome_load' );
