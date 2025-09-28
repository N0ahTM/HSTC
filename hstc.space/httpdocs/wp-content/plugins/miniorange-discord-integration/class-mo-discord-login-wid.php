<?php
/**
 * Discord configured app function.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Adding requires files.
 */

require_once 'mo-discord-login-functions.php';
add_action( 'wp_login', 'mo_discord_link_account', 5, 2 );
add_action( 'wp_login', 'mo_discord_login_redirect', 11, 2 );
add_action( 'mo_user_register', 'mo_discord_update_role', 1, 2 );
add_action( 'delete_user', 'mo_discord_delete_account_linking_rows' );
add_action(
	'widgets_init',
	function () {
		register_widget( 'mo_discord_login_wid' );
	}
);

if ( get_option( 'mo_discord_logout_redirection_enable' ) == 1 ) {
	add_filter( 'logout_url', 'mo_discord_redirect_after_logout', 0, 1 );
}

/**
 * Mo discord login wid
 */
class Mo_Discord_Login_Wid  extends WP_Widget {
	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct(
			'mo_discord_login_wid',
			'miniOrange Discord Login Widget',
			array(
				'description'                 => __( 'Login using Discord', 'flw' ),
				'customize_selective_refresh' => true,
			)
		);
	}
	/**
	 * Widget
	 *
	 * @param [array]  $args array.
	 * @param [string] $instance instance.
	 * @return void
	 */
	public function widget( $args, $instance ) {
		$allowed_html = array(
			'div'   => array(),
			'class' => array(),
		);
		echo wp_kses( $args['before_widget'], $allowed_html );
		$this->discordloginForm();

		echo wp_kses( $args['after_widget'], $allowed_html );
	}
	/**
	 * Update.
	 *
	 * @param [string] $new_instance new insatnce.
	 * @param [string] $old_instance old instance.
	 * @return string
	 */
	public function update( $new_instance, $old_instance ) {
		$instance              = array();
		$instance['wid_title'] = wp_strip_all_tags( $new_instance['wid_title'] );
		return $instance;
	}
	/**
	 * Login Form.
	 *
	 * @return void
	 */
	public function discordloginForm() {
		$selected_theme      = esc_attr( get_option( 'mo_discord_login_theme' ) );
		$apps_configured     = esc_attr( get_option( 'mo_discord_enable' ) );
		$spacebetweenicons   = esc_attr( get_option( 'mo_login_icon_space' ) );
		$custom_width        = esc_attr( get_option( 'mo_login_icon_custom_width' ) );
		$custom_height       = esc_attr( get_option( 'mo_login_icon_custom_height' ) );
		$custom_size         = esc_attr( get_option( 'mo_login_icon_custom_size' ) );
		$custom_background   = esc_attr( get_option( 'mo_login_icon_custom_color' ) );
		$custom_theme        = esc_attr( get_option( 'mo_discord_login_custom_theme' ) );
		$custom_textof_title = esc_attr( get_option( 'mo_discord_login_button_customize_text' ) );
		$custom_boundary     = esc_attr( get_option( 'mo_login_icon_custom_boundary' ) );
		$custom_logout_name  = esc_attr( get_option( 'mo_discord_login_widget_customize_logout_name_text' ) );
		$custom_logout_link  = esc_attr( get_option( 'mo_discord_login_widget_customize_logout_text' ) );
		$custom_text_color   = esc_attr( get_option( 'mo_login_discord_login_widget_customize_textcolor' ) );
		$custom_text         = esc_html( get_option( 'mo_discord_login_widget_customize_text' ) );
		$application_pos     = esc_attr( get_option( 'app_pos' ) );

		$protocol    = ( ( ! empty( $_SERVER['HTTPS'] ) && 'off' !== $_SERVER['HTTPS'] ) || 443 === isset( $_SERVER['SERVER_PORT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['SERVER_PORT'] ) ) : '' ) ? 'https://' : 'http://';
		$sign_up_url = $protocol . isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '' . esc_url_raw( isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' );
		$mo_url      = strstr( $sign_up_url, '?', true );
		if ( $mo_url ) {
			setcookie( 'mo_discord_signup_url', $mo_url, time() + ( 86400 * 30 ), '/' );} else {
			setcookie( 'mo_discord_signup_url', $sign_up_url, time() + ( 86400 * 30 ), '/' );}

			if ( ! is_user_logged_in() ) {
				$values               = array(
					'appsConfigured'    => $apps_configured,
					'selected_apps'     => '',
					'application_pos'   => $application_pos,
					'customTextColor'   => $custom_text_color,
					'customText'        => $custom_text,
					'selected_theme'    => $selected_theme,
					'view'              => '',
					'spacebetweenicons' => $spacebetweenicons,
					'customWidth'       => $custom_width,
					'customHeight'      => $custom_height,
					'customBoundary'    => $custom_boundary,
					'buttonText'        => $custom_textof_title,
					'customTextofTitle' => $custom_textof_title,
					'customSize'        => $custom_size,
					'html'              => '',
					'customBackground'  => $custom_background,
					'customTheme'       => $custom_theme,
				);
				$html                 = $this->mo_discord_display_apps( $values );
				$html                .= '<br/>';
				$plugins_allowedtags1 = array(
					'div' => array( 'class' => array() ),
					'p'   => array( 'style' => array() ),
					'a'   => array(
						'rel'     => array(),
						'style'   => array(),
						'class'   => array(),
						'onclick' => array(),
					),
					'i'   => array(
						'style' => array(),
						'class' => array(),
					),
				);
				echo ( wp_kses( $html, $plugins_allowedtags1 ) );
			} else {
				$current_user       = wp_get_current_user();
				$custom_logout_name = str_replace( '##username##', $current_user->display_name, $custom_logout_name );
				$link_with_username = $custom_logout_name;
				if ( empty( $custom_logout_name ) || empty( $custom_logout_link ) ) {
					?>
				<div id="logged_in_user" class="mo_discord_login_wid">
					<!-- insted of esc_attr_e esc_attr used -->
					<li><?php echo esc_attr( $link_with_username ); ?> <a href="<?php echo esc_url( wp_logout_url( site_url() ) ); ?>" title="<?php esc_attr_e( 'Logout', 'flw' ); ?>"><?php esc_attr( $custom_logout_link ); ?></a></li>
				</div>
					<?php
				} else {
					?>
				<div id="logged_in_user" class="mo_discord_login_wid">
					<li><?php echo esc_attr( $link_with_username ); ?> <a href="<?php echo esc_url( wp_logout_url( site_url() ) ); ?>" title="<?php esc_attr_e( 'Logout', 'flw' ); ?>"><?php esc_attr( $custom_logout_link ); ?></a></li>
				</div>
					<?php
				}
			}
	}
	/**
	 * Custom app exists
	 *
	 * @param [string] $app_name Name of app.
	 * @return boolean
	 */
	public function if_discord_custom_app_exists( $app_name ) {

		if ( get_option( 'mo_discord_login_app' ) ) {
			$appslist = maybe_unserialize( get_option( 'mo_discord_login_app' ) );
			if ( isset( $appslist[ $app_name ] ) ) {
				if ( get_option( 'mo_discord_enable_custom_app_' . $app_name ) ) {
					return 'true';
				} else {
					return 'false';
				}
			} else {
				return 'false';
			}
		}
		return 'false';
	}
	/**
	 * DiscordloginFormShortCode
	 *
	 * @param [array] $atts atts.
	 * @return html
	 */
	public function discordloginFormShortCode( $atts ) {
		global $post;
		$html                = '';
		$apps                = '';
		$selected_theme      = isset( $atts['shape'] ) ? esc_attr( $atts['shape'] ) : esc_attr( get_option( 'mo_discord_login_theme' ) );
		$selected_apps       = isset( $atts['apps'] ) ? esc_attr( $atts['apps'] ) : '';
		$application_pos     = esc_attr( get_option( 'app_pos' ) );
		$apps_configured     = esc_attr( get_option( 'mo_discord_enable' ) );
		$spacebetweenicons   = isset( $atts['space'] ) ? esc_attr( intval( $atts['space'] ) ) : esc_attr( intval( get_option( 'mo_login_icon_space' ) ) );
		$custom_width        = isset( $atts['width'] ) ? esc_attr( intval( $atts['width'] ) ) : esc_attr( intval( get_option( 'mo_login_icon_custom_width' ) ) );
		$custom_height       = isset( $atts['height'] ) ? esc_attr( intval( $atts['height'] ) ) : esc_attr( intval( get_option( 'mo_login_icon_custom_height' ) ) );
		$custom_size         = isset( $atts['size'] ) ? esc_attr( intval( $atts['size'] ) ) : esc_attr( intval( get_option( 'mo_login_icon_custom_size' ) ) );
		$custom_background   = isset( $atts['background'] ) ? esc_attr( $atts['background'] ) : esc_attr( get_option( 'mo_login_icon_custom_color' ) );
		$custom_theme        = isset( $atts['theme'] ) ? esc_attr( $atts['theme'] ) : esc_attr( get_option( 'mo_discord_login_custom_theme' ) );
		$button_text         = esc_html( get_option( 'mo_discord_login_button_customize_text' ) );
		$custom_textof_title = esc_attr( get_option( 'mo_discord_login_button_customize_text' ) );
		$logout_url          = esc_url( wp_logout_url( site_url() ) );
		$custom_boundary     = isset( $atts['edge'] ) ? esc_attr( $atts['edge'] ) : esc_attr( get_option( 'mo_login_icon_custom_boundary' ) );
		$custom_logout_name  = esc_attr( get_option( 'mo_discord_login_widget_customize_logout_name_text' ) );
		$custom_logout_link  = get_option( 'mo_discord_login_widget_customize_logout_text' );
		$custom_text_color   = isset( $atts['color'] ) ? esc_attr( $atts['color'] ) : esc_attr( get_option( 'mo_login_discord_login_widget_customize_textcolor' ) );
		$custom_text         = isset( $atts['heading'] ) ? esc_html( $atts['heading'] ) : esc_html( get_option( 'mo_discord_login_widget_customize_text' ) );
		$view                = isset( $atts['view'] ) ? esc_attr( $atts['view'] ) : '';
		$appcnt              = isset( $atts['appcnt'] ) ? esc_attr( $atts['appcnt'] ) : '';
		if ( 'longbuttonwithtext' === $selected_theme ) {
			$selected_theme = 'longbutton';
		}

		if ( 'custombackground' === $custom_theme ) {
			$custom_theme = 'custom';
		}

		$protocol    = ( ( ! empty( $_SERVER['HTTPS'] ) && 'off' !== $_SERVER['HTTPS'] ) || ( ! empty( $_SERVER['SERVER_PORT'] ) && 443 === $_SERVER['SERVER_PORT'] ) ) ? 'https://' : 'http://';
		$sign_up_url = $protocol . isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '' . esc_url_raw( isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' );
		$mo_url      = strstr( $sign_up_url, '?', true );
		if ( $mo_url ) {
			setcookie( 'mo_discord_signup_url', $mo_url, time() + ( 86400 * 30 ), '/' );} else {
			setcookie( 'mo_discord_signup_url', $sign_up_url, time() + ( 86400 * 30 ), '/' );}
			if ( ! is_user_logged_in() ) {

				$values = array(
					'appsConfigured'    => $apps_configured,
					'selected_apps'     => $selected_apps,
					'application_pos'   => $application_pos,
					'customTextColor'   => $custom_text_color,
					'customText'        => $custom_text,
					'selected_theme'    => $selected_theme,
					'view'              => $view,
					'spacebetweenicons' => $spacebetweenicons,
					'customWidth'       => $custom_width,
					'customHeight'      => $custom_height,
					'customBoundary'    => $custom_boundary,
					'buttonText'        => $button_text,
					'customTextofTitle' => $custom_textof_title,
					'customSize'        => $custom_size,
					'html'              => $html,
					'customBackground'  => $custom_background,
					'customTheme'       => $custom_theme,
					'appcnt'            => $appcnt,
				);
				$html   = $this->mo_discord_display_apps( $values );

			} else {
				$current_user       = wp_get_current_user();
				$custom_logout_name = str_replace( '##username##', $current_user->display_name, $custom_logout_name );
				$flw                = __( $custom_logout_link, 'flw' );// phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- Ignoring string literal error since $custom_logout_link is changing every time
				if ( empty( $custom_logout_name ) || empty( $custom_logout_link ) ) {
					$html .= '<div id="logged_in_user" class="mo_discord_login_wid">' . esc_attr( $custom_logout_name ) . ' <a href=' . esc_attr( $logout_url ) . ' title=" ' . esc_attr( $flw ) . '"> ' . esc_attr( $flw ) . '</a></div>';
				} else {
					$html .= '<div id="logged_in_user" class="mo_discord_login_wid">' . esc_attr( $custom_logout_name ) . ' <a href=' . esc_attr( $logout_url ) . ' title=" ' . esc_attr( $flw ) . '"> ' . esc_attr( $flw ) . '</a></div>';
				}
			}
			return $html;
	}
	/**
	 * Display app
	 *
	 * @param [string] $values values.
	 * @return string
	 */
	public function mo_discord_display_apps( $values ) {
		$apps_configured     = esc_attr( $values['appsConfigured'] );
		$selected_apps       = esc_attr( $values['selected_apps'] );
		$application_pos     = esc_attr( $values['application_pos'] );
		$custom_text_color   = esc_attr( $values['customTextColor'] );
		$custom_text         = esc_attr( $values['customText'] );
		$spacebetweenicons   = esc_attr( $values['spacebetweenicons'] );
		$custom_width        = esc_attr( $values['customWidth'] );
		$custom_height       = esc_attr( $values['customHeight'] );
		$custom_boundary     = esc_attr( $values['customBoundary'] );
		$button_text         = esc_attr( $values['buttonText'] );
		$custom_textof_title = esc_attr( $values['customTextofTitle'] );
		$custom_size         = esc_attr( $values['customSize'] );
		$selected_theme      = esc_attr( $values['selected_theme'] );
		$html                = esc_html( $values['html'] );
		$view                = esc_attr( $values['view'] );
		$custom_background   = esc_attr( $values['customBackground'] );
		$custom_theme        = esc_attr( $values['customTheme'] );
		$appcnt              = isset( $values['appcnt'] ) ? esc_attr( $values['appcnt'] ) : '';

		if ( $apps_configured || '' !== $selected_apps ) {

			if ( '' !== $selected_apps ) {
				$apps = explode( ',', $selected_apps );
			} else {
				$apps = explode( '#', $application_pos );
			}

			$this->mo_discord_load_login_script();
			$html .= "<div class='mo-discord-app-icons'>
					 <p style='color:" . $custom_text_color . "; width: fit-content;'> $custom_text</p>";
			$count = -1;
			if ( '' !== $selected_apps ) {
				if ( mo_discord_is_customer_registered() ) {
					foreach ( $apps as $select_apps ) {

						if ( 'longbutton' === $selected_theme ) {

							if ( 'horizontal' === $view && isset( $appcnt ) ) {
								$count++;
								if ( '' === $count . $appcnt ) {
									$html .= '<br/>';
									$count = 0;
								}
							}
						}
						$app_values = array(
							'spacebetweenicons' => $spacebetweenicons,
							'customWidth'       => $custom_width,
							'customHeight'      => $custom_height,
							'customBoundary'    => $custom_boundary,
							'buttonText'        => $button_text,
							'customTextofTitle' => $custom_textof_title,
							'customSize'        => $custom_size,
							'selected_theme'    => $selected_theme,
							'html'              => $html,
							'view'              => $view,
							'customBackground'  => $custom_background,
							'customTheme'       => $custom_theme,
							'customer_register' => 'yes',
						);
						$html       = $this->mo_discord_select_app( $select_apps, $app_values );
					}
				} else {
					foreach ( $apps as $select_apps ) {
						if ( 'longbutton' === $selected_theme ) {
							if ( 'horizontal' === $view && isset( $appcnt ) ) {
								$count++;
								if ( $count === $appcnt ) {
									$html .= '<br/>';
									$count = 0;
								}
							}
						}
						$app_values = array(
							'spacebetweenicons' => $spacebetweenicons,
							'customWidth'       => $custom_width,
							'customHeight'      => $custom_height,
							'customBoundary'    => $custom_boundary,
							'buttonText'        => $button_text,
							'customTextofTitle' => $custom_textof_title,
							'customSize'        => $custom_size,
							'selected_theme'    => $selected_theme,
							'html'              => $html,
							'view'              => $view,
							'customBackground'  => $custom_background,
							'customTheme'       => $custom_theme,
							'customer_register' => 'no',
						);
						$html       = $this->mo_discord_select_app( $select_apps, $app_values );
					}
				}
			} else {
				foreach ( $apps as $select_apps ) {
					if ( get_option( 'mo_' . $select_apps . '_enable' ) ) {
						if ( 'longbutton' === $selected_theme ) {
							if ( 'horizontal' === $view && isset( $appcnt ) ) {
								$count++;
								if ( $count === $appcnt ) {
									$html .= '<br/>';
									$count = 0;
								}
							}
						}
						$app_values = array(
							'spacebetweenicons' => $spacebetweenicons,
							'customWidth'       => $custom_width,
							'customHeight'      => $custom_height,
							'customBoundary'    => $custom_boundary,
							'buttonText'        => $button_text,
							'customTextofTitle' => $custom_textof_title,
							'customSize'        => $custom_size,
							'selected_theme'    => $selected_theme,
							'html'              => $html,
							'view'              => $view,
							'customBackground'  => $custom_background,
							'customTheme'       => $custom_theme,
							'customer_register' => 'yes',
						);
						$html       = $this->mo_discord_select_app( $select_apps, $app_values );
					}
				}
			}
			$html .= '</div> <br>';
		} else {
			$html .= '<div>No apps configured. Please contact your administrator.</div>';
		}
		return $html;
	}
	/**
	 * Undocumented function
	 *
	 * @param [array] $select_apps selected apps.
	 * @param [array] $app_values selected values.
	 * @return string
	 */
	public function mo_discord_select_app( $select_apps, $app_values ) {
		$version = get_option( 'mo_discord_integrator_version' );
		if ( get_option( 'mo_discord_fonawesome_load' ) === '1' ) {
			wp_enqueue_style( 'mo-discord-sl-wp-font-awesome', plugins_url( 'includes/css/mo-font-awesome.min.css', __FILE__ ), false, $version );
		}
		wp_enqueue_style( 'mo-wp-style-icon', plugins_url( 'includes/css/mo_discord_login_icons.min.css', __FILE__ ), false, $version );
		wp_enqueue_style( 'mo-wp-bootstrap-social', plugins_url( 'includes/css/bootstrap-discord.min.css', __FILE__ ), false, $version );
		if ( get_option( 'mo_discord_bootstrap_load' ) === '1' ) {
			wp_enqueue_style( 'mo-wp-bootstrap-main', plugins_url( 'includes/css/bootstrap.min-preview.min.css', __FILE__ ), false, $version );
		}

		$spacebetweenicons   = $app_values['spacebetweenicons'];
		$custom_width        = $app_values['customWidth'];
		$custom_height       = $app_values['customHeight'];
		$custom_boundary     = $app_values['customBoundary'];
		$button_text         = $app_values['buttonText'];
		$custom_textof_title = $app_values['customTextofTitle'];
		$custom_size         = $app_values['customSize'];
		$selected_theme      = $app_values['selected_theme'];
		$html                = $app_values['html'];
		$view                = $app_values['view'];
		$custom_background   = $app_values['customBackground'];
		$custom_theme        = $app_values['customTheme'];
		switch ( $select_apps ) {

			case 'discord':
				$custom_app                        = esc_attr( $this->if_discord_custom_app_exists( 'discord' ) );
				'false' === $custom_app ? $app_dis = 'disable' : $app_dis = '';
				$html                              = $this->mo_discord_add_apps( 'discord', $custom_theme, $spacebetweenicons, $custom_width, $custom_height, $custom_boundary, $button_text, $custom_textof_title, $custom_size, $selected_theme, $custom_app, $html, $view, $custom_background, $app_dis );
				break;
		}
		return $html;
	}
	/**
	 * Undocumented function
	 *
	 * @param [type] $app_name App name.
	 * @param [type] $theme theme.
	 * @param [type] $spacebetweenicons space between icons.
	 * @param [type] $custom_width custom width.
	 * @param [type] $custom_height custom height.
	 * @param [type] $custom_boundary custom boundary.
	 * @param [type] $button_text button text.
	 * @param [type] $custom_textof_title custom text of title.
	 * @param [type] $custom_size custom size.
	 * @param [type] $selected_theme theme.
	 * @param [type] $custom_app custom app.
	 * @param [type] $html html.
	 * @param [type] $view view.
	 * @param [type] $custom_background custom background.
	 * @param [type] $app_dis app dis.
	 * @return string
	 */
	public function mo_discord_add_apps( $app_name, $theme, $spacebetweenicons, $custom_width, $custom_height, $custom_boundary, $button_text, $custom_textof_title, $custom_size, $selected_theme, $custom_app, $html, $view, $custom_background, $app_dis ) {
		$default_color = array( 'discord' => '#7289da' );

		if ( 'auto' !== $custom_width || 'Auto' === $custom_width || 'AUTO' === $custom_width ) {
			$custom_width .= 'px';
		}
		if ( 'default' === $theme ) {
			if ( 'discord' === $app_name ) {
				if ( 'longbutton' === $selected_theme ) {

					$html .= "<a style='margin-left: " . $spacebetweenicons . 'px !important;width: ' . $custom_width . ' !important;padding-top:' . ( $custom_height - 29 ) . 'px !important;padding-bottom:' . ( $custom_height - 29 ) . 'px !important;margin-bottom: ' . ( $spacebetweenicons ) . 'px !important;border-radius: ' . $custom_boundary . "px !important;' class='mo_btn mo_btn-mo mo_btn-block mo_btn-social mo_btn-discord mo_btn-custom-dec login-button' onClick=\"moDiscordLogin('discord','" . $custom_app . "');\" rel='nofollow'";
					$html .= "> <i style='padding-top:" . ( $custom_height - 35 ) . "px !important' class='fab fa-discord'></i>" . $button_text . ' discord</a>';
				} else {
					$html .= "<a class='login-button' rel='nofollow' title= ' " . $custom_textof_title . " discord'";

					if ( 'disable' !== $app_dis ) {
						$html .= " onClick=\"moDiscordLogin('discord','" . $custom_app . "');\"";
					} $html .= " title= ' " . $custom_textof_title . "  discord'><i style='margin-top:10px;width:" . $custom_size . 'px !important;height:' . $custom_size . 'px !important;margin-left:' . ( $spacebetweenicons ) . 'px !important;background:' . $default_color['discord'] . ';font-size: ' . ( $custom_size - 16 ) . "px !important;text-align:center; padding-top: 8px;color:white'  class='fab fa-discord  mo_btn-mo mo_discord-login-button login-button " . $selected_theme . "' ></i></a>";
				}
				return $html;
			}
		}

	}
	/**
	 * Mo discord load login script
	 *
	 * @return void
	 */
	private function mo_discord_load_login_script() {
		$version = get_option( 'mo_discord_integrator_version' );
		?>
		<script type="text/javascript">
			jQuery(document).ready(function () {
				jQuery(".login-button").css("cursor", "pointer");
			});
			var perfEntries = performance.getEntriesByType("navigation");

			if (perfEntries[0].type === "back_forward") {
				location.reload(true);
			}
			function HandlePopupResult(result) {
				window.location = "<?php echo esc_url( mo_discord_get_redirect_url() ); ?>";
			}
			function moDiscordLogin(app_name,is_custom_app) {
				var current_url = window.location.href;
				var cookie_name = "redirect_current_url";
				var d = new Date();
				d.setTime(d.getTime() + (2 * 24 * 60 * 60 * 1000));
				var expires = "expires="+d.toUTCString();
				document.cookie = cookie_name + "=" + current_url + ";" + expires + ";path=/";

				<?php
				if ( isset( $_SERVER['HTTPS'] ) && ! empty( $_SERVER['HTTPS'] ) && 'off' !== $_SERVER['HTTPS'] ) {
					$http = 'https://';
				} else {
					$http = 'http://';
				}
				?>
				var base_url = '<?php echo esc_url( site_url() ); ?>';
				var request_uri = '<?php echo esc_url( isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ); ?>';
				var http = '<?php echo esc_attr( $http ); ?>';
				var http_host = '<?php echo esc_attr( isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '' ); ?>';
				var custom_nonce = '<?php echo esc_attr( wp_create_nonce( 'mo-discord-oauth-app-nonce' ) ); ?>';
					if ( request_uri.indexOf('wp-login.php') !==-1){
						var redirect_url = base_url + '/?option=oauthredirect&wp_nonce=' + custom_nonce + '&app_name=';

					}else {
						var redirect_url = http + http_host + request_uri;
						if(redirect_url.indexOf('?') !== -1)
							redirect_url = redirect_url +'&option=oauthredirect&wp_nonce=' + custom_nonce + '&app_name=';
						else
							redirect_url = redirect_url +'?option=oauthredirect&wp_nonce=' + custom_nonce + '&app_name=';
					}

				window.location.href = redirect_url + app_name;
			}
		</script>
		<?php
	}
}

/**
 * Get redirect url.
 *
 * @return string
 */
function mo_discord_get_redirect_url() {
	$current_url = isset( $_COOKIE['redirect_current_url'] ) ? esc_url_raw( wp_unslash( $_COOKIE['redirect_current_url'] ) ) : get_option( 'siteurl' );
	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
	$uri         = ! empty( $request_uri ) ? $request_uri : '';

	$pos = false === strpos( $uri, '/disidcallback' );

	if ( $pos ) {
		$url = '';

		if ( ! empty( $uri ) ) {
			$url = str_replace( '?option=modisid', '', $uri );
		}

		$current_url = str_replace( '?option=modisid', '', $current_url );
	} else {
		$temp_array1 = explode( '/disidcallback', $uri );
		$url         = $temp_array1[0];

		$temp_array2 = explode( '/disidcallback', $current_url );
		$current_url = $temp_array2[0];
	}

	$option       = get_option( 'mo_discord_login_redirect' );
	$redirect_url = site_url();

	if ( 'same' === $option ) {
		if ( ! is_null( $current_url ) ) {
			if ( false !== strpos( $current_url, get_option( 'siteurl' ) . '/wp-login.php' ) ) {
				$redirect_url = get_option( 'siteurl' );
			} else {
				$redirect_url = $current_url;
			}
		} else {
			if ( isset( $_SERVER['HTTPS'] ) && ! empty( $_SERVER['HTTPS'] ) && 'off' != $_SERVER['HTTPS'] ) {
				$http = 'https://';
			} else {
				$http = 'http://';
			}

			if ( isset( $_SERVER['HTTP_HOST'] ) && ! empty( $_SERVER['HTTP_HOST'] ) ) {
				$redirect_url = urldecode( html_entity_decode( esc_url( $http . sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) . $url ) ) );
			}

			if ( html_entity_decode( esc_url( remove_query_arg( 'ss_message', $redirect_url ) ) ) == wp_login_url() || false !== strpos( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), 'wp-login.php' ) || false !== strpos( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), 'wp-admin' ) ) {
				$redirect_url = site_url() . '/';
			}
		}
	} elseif ( 'homepage' === $option ) {
		$redirect_url = site_url();
	} elseif ( 'dashboard' === $option ) {
		$redirect_url = admin_url();
	} elseif ( 'custom' === $option ) {
		$redirect_url = get_option( 'mo_discord_login_redirect_url' );
	} elseif ( 'relative' === $option ) {
		$redirect_url = site_url() . ( null !== get_option( 'mo_discord_relative_login_redirect_url' ) ? get_option( 'mo_discord_relative_login_redirect_url' ) : '' );
	}

	return $redirect_url;
}


/**
 * Get logout url.
 *
 * @param [string] $logout_url logout url.
 * @return string
 */
function mo_discord_redirect_after_logout( $logout_url ) {
	if ( get_option( 'mo_discord_logout_redirection_enable' ) ) {
		$logout_redirect_option = get_option( 'mo_discord_logout_redirect' );
		$redirect_url           = site_url();
		if ( 'homepage' == $logout_redirect_option ) {
			$redirect_url = $logout_url . '&redirect_to=' . home_url();
		} elseif ( 'currentpage' == $logout_redirect_option ) {
			if ( isset( $_SERVER['HTTPS'] ) && ! empty( $_SERVER['HTTPS'] ) && 'off' != $_SERVER['HTTPS'] ) {
				$http = 'https://';
			} else {
				$http = 'http://';
			}
			if ( isset( $_SERVER['HTTP_HOST'], $_SERVER['REQUEST_URI'] ) && ! empty( $_SERVER['HTTP_HOST'] ) && ! empty( $_SERVER['REQUEST_URI'] ) ) {
				$redirect_url = $logout_url . '&redirect_to=' . $http . sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) . sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) );
			}
		} elseif ( 'login' == $logout_redirect_option ) {
			$redirect_url = $logout_url . '&redirect_to=' . site_url() . '/wp-admin';
		} elseif ( 'custom' == $logout_redirect_option ) {
			$redirect_url = $logout_url . '&redirect_to=' . site_url() . ( null !== get_option( 'mo_discord_logout_redirect_url' ) ? get_option( 'mo_discord_logout_redirect_url' ) : '' );
		}
		return $redirect_url;
	} else {
		return $logout_url;
	}

}

/**
 * Login validate
 *
 * @return void
 */
function mo_discord_login_validate() {
	if ( isset( $_POST['mo_discord_go_back_registration_nonce'] ) && isset( $_POST['option'] ) && 'mo_discord_go_back_registration' === $_POST['option'] ) {
		$nonce = sanitize_text_field( wp_unslash( $_POST['mo_discord_go_back_registration_nonce'] ) );
		if ( ! wp_verify_nonce( $nonce, 'mo-discord-go-back-register-nonce' ) ) {
			wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
		} elseif ( current_user_can( 'administrator' ) ) {
			update_option( 'mo_discord_verify_customer', 'true' );
		}
	} elseif ( isset( $_POST['mo_discord_go_back_login_nonce'] ) && isset( $_POST['option'] ) && 'mo_discord_go_back_login' === $_POST['option'] ) {
		$nonce = sanitize_text_field( wp_unslash( $_POST['mo_discord_go_back_login_nonce'] ) );
		if ( ! wp_verify_nonce( $nonce, 'mo-discord-go-back-login-nonce' ) ) {
			wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
		} elseif ( current_user_can( 'administrator' ) ) {
			update_option( 'mo_discord_registration_status', '' );
			delete_option( 'mo_discord_admin_email' );
			delete_option( 'mo_discord_admin_phone' );
			delete_option( 'mo_discord_admin_customer_key' );
			delete_option( 'mo_discord_verify_customer' );
		}
	} elseif ( isset( $_POST['mo_discord_forgot_password_nonce'] ) && isset( $_POST['option'] ) && 'mo_discord_forgot_password' === $_POST['option'] ) {
		$nonce = sanitize_text_field( wp_unslash( $_POST['mo_discord_forgot_password_nonce'] ) );
		if ( ! wp_verify_nonce( $nonce, 'mo-discord-forgot-password-nonce' ) ) {
			wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
		} elseif ( current_user_can( 'administrator' ) ) {
			$email = '';
			if ( mo_discord_check_empty_or_null( $email ) ) {
				if ( mo_discord_check_empty_or_null( isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '' ) ) {
					update_option( 'mo_discord_message', 'No email provided. Please enter your email below to reset password.' );
					mo_discord_show_error_message();
					return;
				} else {
					$email = sanitize_email( wp_unslash( $_POST['email'] ) );
				}
			}
			$customer = new MoCustomerDiscordverification();
			$content  = json_decode( $customer->mo_dis_forgot_password( $email ), true );
			if ( strcasecmp( $content['status'], 'SUCCESS' ) === 0 ) {
				update_option( 'mo_discord_message', 'You password has been reset successfully. Please enter the new password sent to your registered mail here.' );
				mo_discord_show_success_message();
			} else {
				update_option( 'mo_discord_message', 'An error occurred while processing your request. Please make sure you are registered in miniOrange with the <b>' . $content['email'] . '</b> email address. ' );
				mo_discord_show_error_message();
			}
		}
	} elseif ( isset( $_POST['mo_discord_connect_register_nonce'] ) && isset( $_POST['option'] ) && 'mo_discord_connect_register_customer' === $_POST['option'] ) {    // register the admin to miniOrange.
		$nonce            = sanitize_text_field( wp_unslash( $_POST['mo_discord_connect_register_nonce'] ) );
		$action           = esc_attr( isset( $_POST['action'] ) ? sanitize_text_field( wp_unslash( $_POST['action'] ) ) : '' );
		$email            = '';
		$password         = '';
		$confirm_password = '';
		if ( ! wp_verify_nonce( $nonce, 'mo-discord-connect-register-nonce' ) ) {
			wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
		} elseif ( current_user_can( 'administrator' ) ) {
			$email            = sanitize_email( isset( $_POST['email'] ) ? sanitize_text_field( wp_unslash( $_POST['email'] ) ) : '' );
			$password         = isset( $_POST['password'] ) ? stripslashes( $_POST['password'] ) : ''; //phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- As we are not storing password in the database, so we can ignore sanitization. Preventing use of sanitization in password will lead to removal of special characters.
			$confirm_password = isset( $_POST['confirmPassword'] ) ? stripslashes( $_POST['confirmPassword'] ) : '';//phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- As we are not storing password in the database, so we can ignore sanitization. Preventing use of sanitization in password will lead to removal of special characters. 
			mo_discord_register_user( $action, $email, $password, $confirm_password );
		}
	} elseif ( isset( $_REQUEST['option'] ) && strpos( sanitize_text_field( wp_unslash( $_REQUEST['option'] ) ), 'oauthredirect' ) !== false ) {
		if ( isset( $_REQUEST['wp_nonce'] ) ) {
			$nonce = sanitize_text_field( wp_unslash( $_REQUEST['wp_nonce'] ) );
			if ( ! wp_verify_nonce( $nonce, 'mo-discord-oauth-app-nonce' ) ) {
				wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
			} else {
				$appname = isset( $_REQUEST['app_name'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['app_name'] ) ) : '';
				mo_discord_custom_app_oauth_redirect( $appname );
			}
		}
	} elseif ( isset( $_POST['mo_discord_connect_verify_nonce'] ) && isset( $_POST['option'] ) && 'mo_discord_connect_verify_customer' === $_POST['option'] ) {
		$nonce  = sanitize_text_field( wp_unslash( $_POST['mo_discord_connect_verify_nonce'] ) );
		$action = isset( $_POST['action'] ) ? sanitize_text_field( wp_unslash( $_POST['action'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'mo-discord-connect-verify-nonce' ) ) {
			wp_die( '<strong>ERROR</strong>: Please Go back and Refresh the page and try again!<br/>If you still face the same issue please contact your Administrator.' );
		} elseif ( current_user_can( 'administrator' ) ) {
			$email    = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
			$password = isset( $_POST['password'] ) ? stripslashes( $_POST['password'] ) : '';//phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- As we are not storing password in the database, so we can ignore sanitization. Preventing use of sanitization in password will lead to removal of special characters.
			mo_discord_register_old_user( $action, $email, $password );
		}
	} elseif ( strpos( isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '', 'disidcallback' ) !== false || ( ( strpos( isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '', 'oauth_token' ) !== false ) && ( strpos( isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '', 'oauth_verifier' ) ) ) ) {
		mo_discord_process_custom_app_callback();
	}
}
/**
 * Get current customer.
 *
 * @param [string] $action action.
 * @param [string] $password password.
 * @return void
 */
function get_current_discord_customer( $action, $password ) {
	$customer     = new MoCustomerDiscordverification();
	$content      = $customer->get_dis_customer_key( $password );
	$customer_key = json_decode( $content, true );
	if ( isset( $customer_key ) && current_user_can( 'administrator' ) ) {
		update_option( 'mo_discord_admin_customer_key', $customer_key['id'] );
		update_option( 'mo_discord_admin_api_key', $customer_key['apiKey'] );
		update_option( 'mo_discord_customer_token', $customer_key['token'] );
		update_option( 'mo_discord_message', 'Your account has been retrieved successfully.' );
		delete_option( 'mo_discord_verify_customer' );
		delete_option( 'mo_discord_new_registration' );
		if ( 'mo_register_new_user' === $action ) {
			wp_send_json( array( 'success' => 'Your account has been retrieved successfully.' ) );
		} else {
			mo_discord_show_success_message();
		}
	} elseif ( current_user_can( 'administrator' ) ) {
		update_option( 'mo_discord_message', 'You already have an account with miniOrange. Please enter a valid password.' );
		update_option( 'mo_discord_verify_customer', 'true' );
		delete_option( 'mo_discord_new_registration' );
		if ( 'mo_register_new_user' === $action ) {
			wp_send_json( array( 'error' => 'You already have an account with miniOrange. Please enter a valid password.' ) );
		} else {
			mo_discord_show_error_message();
		}
	}
}
/**
 * Login redirect
 *
 * @param string $username username.
 * @param [type] $user user.
 * @return void
 */
function mo_discord_login_redirect( $username = '', $user = null ) {
	mo_discord_start_session();
	$user_id = $user->ID;
	if ( is_string( $username ) && $username && is_object( $user ) && ! empty( $user->ID ) && ( $user_id ) && isset( $_SESSION['mo_login'] ) && $_SESSION['mo_login'] ) {
		$_SESSION['mo_login'] = false;
		wp_set_auth_cookie( $user_id, true );
		$redirect_url = mo_discord_get_redirect_url();
		wp_redirect( $redirect_url );
		exit;
	}
}

/**
 * Link account
 *
 * @param [string] $username username.
 * @param [type]   $user user.
 * @return void
 */
function mo_discord_link_account( $username, $user ) {
	if ( $user ) {
		$userid = $user->ID;
	}
	mo_discord_start_session();

	$user_email            = isset( $_SESSION['user_email'] ) ? sanitize_email( $_SESSION['user_email'] ) : '';
	$social_app_identifier = isset( $_SESSION['social_user_id'] ) ? sanitize_text_field( $_SESSION['social_user_id'] ) : '';
	$social_app_name       = isset( $_SESSION['social_app_name'] ) ? sanitize_text_field( $_SESSION['social_app_name'] ) : '';
	if ( empty( $user_email ) ) {
		$user_email = $user->user_email;
	}
	if ( isset( $userid ) && empty( $social_app_identifier ) && empty( $social_app_name ) ) {
		return;
	} elseif ( ! isset( $userid ) ) {
		return;
	}

	global $wpdb;
	$linked_email_id = $wpdb->get_var( $wpdb->prepare( 'SELECT user_id FROM ' . $wpdb->prefix . 'mo_discord_linked_user where linked_email = %s AND linked_social_app = %s', $user_email, $social_app_name ) );//phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery -- Fetching data from a custom table.
	if ( ! isset( $linked_email_id ) ) {
		mo_discord_insert_query( $social_app_name, $user_email, $userid, $social_app_identifier );
	}
}

/**
 * Undocumented function
 *
 * @param string $user_id User id.
 * @param string $user_url user url.
 * @return void
 */
function mo_discord_update_role( $user_id = '', $user_url = '' ) {
	if ( get_option( 'mo_dis_basic_role_mapping' ) ) {
		$user = get_user_by( 'ID', $user_id );
		$user->set_role( get_option( 'mo_dis_basic_role_mapping' ) );
	}
}


