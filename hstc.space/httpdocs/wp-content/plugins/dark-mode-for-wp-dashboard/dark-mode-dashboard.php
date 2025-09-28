<?php
/**
 * Plugin Name: Dark Mode for WP Dashboard
 * Plugin URI: https://wordpress.org/plugins/dark-mode-for-wp-dashboard/
 * Description: Enable dark mode for the WordPress dashboard
 * Author: Naiche
 * Author URI: https://profiles.wordpress.org/naiches/
 * Text Domain: dark-mode-for-wp-dashboard
 * Version: 1.2.4
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
    die();
}
define('DARK_MODE_DASHBOARD_VERSION', '1.2.4'); // Updated version
define('DARK_MODE_DASHBOARD_PLUGIN_PATH', plugin_dir_url(__FILE__));

/**
* Add styles and scripts
*/
function dark_mode_dashboard_add_styles() {
    /**
    * Check if dark mode is disable for the current user
    */
    if(wp_get_current_user()->dark_mode_dashboard != 1) {
        $dark_mode_dashboard_style = apply_filters( 'dark_mode_dashboard_css', DARK_MODE_DASHBOARD_PLUGIN_PATH . '/assets/css/dark-mode-dashboard.css' );
        wp_register_style( 'dark-mode-dashboard', $dark_mode_dashboard_style, array(), DARK_MODE_DASHBOARD_VERSION );
        wp_enqueue_style( 'dark-mode-dashboard');
    }
    // Enqueue script and localize nonce
    wp_enqueue_script('dark-mode-dashboard-js', plugins_url('js/dark-mode-dashboard.js', __FILE__), array('jquery'), DARK_MODE_DASHBOARD_VERSION, true);
    wp_localize_script('dark-mode-dashboard-js', 'darkModeDashboard', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('dark_mode_dashboard_nonce')
    ));
}
add_action( 'admin_enqueue_scripts', 'dark_mode_dashboard_add_styles' );

/**
* Add field to user profile page
*/
add_action( 'show_user_profile', 'dark_mode_dashboard_user_profile_fields' );
add_action( 'edit_user_profile', 'dark_mode_dashboard_user_profile_fields' );

function dark_mode_dashboard_user_profile_fields( $user ) { ?>
    <h3><?php esc_html_e("Dark Mode for WP Dashboard", "dark-mode-for-wp-dashboard"); ?></h3>

    <table class="form-table">
        <tr>
            <th><label for="darkmode"><?php esc_html_e("Disable darkmode?", "dark-mode-for-wp-dashboard"); ?></label></th>
            <td>
                <input type="checkbox" name="dark_mode_dashboard" id="darkmode" value="1" <?php checked($user->dark_mode_dashboard, true, true); ?>>
            </td>
        </tr>
    </table>
<?php }

/**
* Save data from user profile field to database
*/
add_action( 'personal_options_update', 'dark_mode_dashboard_save_user_profile_fields' );
add_action( 'edit_user_profile_update', 'dark_mode_dashboard_save_user_profile_fields' );

function dark_mode_dashboard_save_user_profile_fields( $user_id ) {
    if ( empty( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'update-user_' . $user_id ) ) {
        return;
    }
    
    if ( !current_user_can( 'edit_user', $user_id ) ) { 
        return false; 
    }

    update_user_meta( $user_id, 'dark_mode_dashboard', $_POST['dark_mode_dashboard'] );
}

/**
* Admin toolbar add toggle
*/
function dark_mode_dashboard_toolbar_link($wp_admin_bar) {
    $args = array(
        'id' => 'dark-mode-dashboard',
        'title' => 'Dark Mode Toggle',
        'href' => '#',
        'meta' => array(
            'class' => 'dark-mode-dashboard', 
            'title' => 'Dark Mode Toggle'
        )
    );
    $wp_admin_bar->add_node($args);
}
add_action('admin_bar_menu', 'dark_mode_dashboard_toolbar_link', 999);

/**
* Admin toolbar toggle, trigger the ajax handler function using jQuery
*/
add_action( 'admin_footer', 'dark_mode_dashboard_toolbar_change_js' );
function dark_mode_dashboard_toolbar_change_js() { ?>
  <script type="text/javascript" >
    jQuery(document).ready(function($) {
        $('#wp-admin-bar-dark-mode-dashboard .ab-item').on('click', function() {
            var data = {
                'action': 'dark_mode_dashboard_change_user_profile_mode',
                'security': darkModeDashboard.nonce
            };

            $.post(darkModeDashboard.ajax_url, data, function(response) {
                if (response.success) {
                    document.location.reload(true);
                } else {
                    alert('Failed to change mode');
                }
            });
        });
    });
  </script>
  <style>
    #wpadminbar #wp-admin-bar-dark-mode-dashboard .ab-item:before {
        content: "\f339";
        top: 2px;
    }
  </style> <?php
}

/**
* Admin toolbar toggle, hook and define ajax handler function
*/
add_action( 'wp_ajax_dark_mode_dashboard_change_user_profile_mode', 'dark_mode_dashboard_change_user_profile_mode' );
function dark_mode_dashboard_change_user_profile_mode() {
    // Verify the nonce
    check_ajax_referer('dark_mode_dashboard_nonce', 'security');

    $user_id = get_current_user_id();

    if ( !current_user_can( 'edit_user', $user_id ) ) { 
        wp_send_json_error('Unauthorized user');
        return false; 
    }

    if(get_user_meta($user_id, 'dark_mode_dashboard', true) == 1) {
        update_user_meta( $user_id, 'dark_mode_dashboard', '' );
    } else {
        update_user_meta( $user_id, 'dark_mode_dashboard', 1 );
    }

    wp_send_json_success();
    wp_die(); // this is required to terminate immediately and return a proper response
}
