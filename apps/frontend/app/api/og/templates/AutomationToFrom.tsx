import Icon from "@/components/shared/Icon";

type Props = {
  title: string;
  automationFrom: { framework: string; image: string };
  automationTo: { framework: string; image: string };
};

const AutomationToFrom = (props: Props) => {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "630px",
        width: "1200px",
        boxSizing: "border-box",
        background: "#F9EBD0",
        color: "#1d1d1b",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_0_137)">
            <rect width="1200" height="630" fill="white" />
            <g opacity="0.4" filter="url(#filter0_f_0_137)">
              <circle
                cx="44.9998"
                cy="53"
                r="300"
                transform="rotate(90 44.9998 53)"
                fill="url(#paint0_linear_0_137)"
              />
            </g>
            <g opacity="0.4" filter="url(#filter1_f_0_137)">
              <ellipse
                cx="1007"
                cy="536"
                rx="480"
                ry="330"
                transform="rotate(-180 1007 536)"
                fill="url(#paint1_linear_0_137)"
              />
            </g>
            <path
              opacity="0.1"
              d="M0 64L1200 64"
              stroke="url(#paint2_linear_0_137)"
            />
            <path
              opacity="0.1"
              d="M1133.5 0V630"
              stroke="url(#paint3_linear_0_137)"
            />
            <circle cx="1133.5" cy="64.5" r="2.5" fill="#0B151E" />
            <circle cx="1133.5" cy="565.5" r="2.5" fill="#0B151E" />
            <path
              opacity="0.1"
              d="M0 566L1200 566"
              stroke="url(#paint4_linear_0_137)"
            />
            <path
              opacity="0.1"
              d="M66.5 0V630"
              stroke="url(#paint5_linear_0_137)"
            />
            <circle cx="66.5" cy="64.5" r="2.5" fill="#0B151E" />
            <circle cx="66.5" cy="565.5" r="2.5" fill="#0B151E" />
          </g>
          <defs>
            <filter
              id="filter0_f_0_137"
              x="-523.859"
              y="-515.858"
              width="1137.72"
              height="1137.72"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="134.429"
                result="effect1_foregroundBlur_0_137"
              />
            </filter>
            <filter
              id="filter1_f_0_137"
              x="319.032"
              y="-1.968"
              width="1375.94"
              height="1075.94"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="103.984"
                result="effect1_foregroundBlur_0_137"
              />
            </filter>
            <linearGradient
              id="paint0_linear_0_137"
              x1="44.9998"
              y1="-247"
              x2="44.9998"
              y2="353"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BBFC03" />
              <stop offset="1" stopColor="#BBFC03" stopOpacity="0.17" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_0_137"
              x1="1007"
              y1="206"
              x2="1007"
              y2="866"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BBFC03" />
              <stop offset="1" stopColor="#BBFC03" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_0_137"
              x1="0.771776"
              y1="64"
              x2="1197.59"
              y2="10.3225"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0B151E" stopOpacity="0" />
              <stop offset="0.165" stopColor="#0B151E" stopOpacity="0.450549" />
              <stop offset="0.495" stopColor="#0B151E" />
              <stop offset="0.775" stopColor="#0B151E" stopOpacity="0.452703" />
              <stop offset="1" stopColor="#0B151E" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_0_137"
              x1="1133.5"
              y1="0.405182"
              x2="1148.32"
              y2="629.651"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0B151E" stopOpacity="0" />
              <stop offset="0.165" stopColor="#0B151E" stopOpacity="0.450549" />
              <stop offset="0.495" stopColor="#0B151E" />
              <stop offset="0.775" stopColor="#0B151E" stopOpacity="0.452703" />
              <stop offset="1" stopColor="#0B151E" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint4_linear_0_137"
              x1="0.771775"
              y1="566"
              x2="1197.59"
              y2="512.322"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0B151E" stopOpacity="0" />
              <stop offset="0.165" stopColor="#0B151E" stopOpacity="0.450549" />
              <stop offset="0.495" stopColor="#0B151E" />
              <stop offset="0.775" stopColor="#0B151E" stopOpacity="0.452703" />
              <stop offset="1" stopColor="#0B151E" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint5_linear_0_137"
              x1="66.5"
              y1="0.405182"
              x2="81.3164"
              y2="629.651"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0B151E" stopOpacity="0" />
              <stop offset="0.165" stopColor="#0B151E" stopOpacity="0.450549" />
              <stop offset="0.495" stopColor="#0B151E" />
              <stop offset="0.775" stopColor="#0B151E" stopOpacity="0.452703" />
              <stop offset="1" stopColor="#0B151E" stopOpacity="0" />
            </linearGradient>
            <clipPath id="clip0_0_137">
              <rect width="1200" height="630" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          margin: "111px 131px",
          boxSizing: "border-box",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "408px",
          width: "938px",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "144px",
            height: "24px",
          }}
        >
          <svg
            width="133"
            height="22"
            viewBox="0 0 133 22"
            fill=""
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_2887_5290)">
              <mask
                id="mask0_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_2887_5290)">
                <path
                  d="M0 21.4475L8.19082 0.475708H10.9211L2.70153 21.4475H0Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask1_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask1_2887_5290)">
                <path
                  d="M16.3478 6.89759C19.9371 6.89759 22.4465 8.94014 22.9431 12.1211H20.2002C19.7333 10.312 18.274 9.34849 16.436 9.34849C13.8391 9.34849 12.0589 11.3325 12.0589 14.426C12.0589 17.5195 13.722 19.4746 16.3197 19.4746C18.2748 19.4746 19.7341 18.4533 20.2299 16.7605H22.9728C22.4185 19.854 19.763 21.9255 16.3197 21.9255C12.1175 21.9255 9.3457 18.9491 9.3457 14.4548C9.3457 9.96061 12.1761 6.89679 16.3494 6.89679L16.3478 6.89759Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask2_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask2_2887_5290)">
                <path
                  d="M31.7827 6.92651C36.0435 6.92651 39.1948 10.02 39.1948 14.426C39.1948 18.832 36.0435 21.9255 31.7827 21.9255C27.5219 21.9255 24.3418 18.832 24.3418 14.426C24.3418 10.02 27.4931 6.92651 31.7827 6.92651ZM31.7827 19.4746C34.5256 19.4746 36.4519 17.4024 36.4519 14.426C36.4519 11.4496 34.5256 9.37741 31.7827 9.37741C29.0398 9.37741 27.1136 11.4496 27.1136 14.426C27.1136 17.4024 29.0101 19.4746 31.7827 19.4746Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask3_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask3_2887_5290)">
                <path
                  d="M40.709 14.4846C40.709 10.1075 43.2481 6.89763 47.4792 6.89763C49.6678 6.89763 51.5066 7.86034 52.4693 9.61167V0.0985107H55.1833V21.5757H52.7324L52.4989 18.9788C51.5651 20.9339 49.6389 21.9263 47.3629 21.9263C43.2192 21.9263 40.7098 18.8328 40.7098 14.4854L40.709 14.4846ZM52.4396 14.3971C52.4396 11.4793 50.7179 9.37821 47.9165 9.37821C45.115 9.37821 43.4808 11.4793 43.4808 14.3971C43.4808 17.3149 45.115 19.4457 47.9165 19.4457C50.7179 19.4457 52.4396 17.3735 52.4396 14.3971Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask4_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask4_2887_5290)">
                <path
                  d="M56.7578 14.4558C56.7578 9.99121 59.5882 6.89771 63.7318 6.89771C67.8755 6.89771 70.4435 9.69918 70.4435 13.9303V14.9516L59.4133 14.9804C59.6179 17.9865 61.1935 19.6496 63.9075 19.6496C66.0375 19.6496 67.4383 18.7743 67.9052 17.1401H70.4732C69.7728 20.2039 67.3797 21.9256 63.849 21.9256C59.6467 21.9256 56.7578 18.8906 56.7578 14.455V14.4558ZM59.4718 13.1425H67.7014C67.7014 10.779 66.1546 9.20339 63.7326 9.20339C61.3106 9.20339 59.8224 10.633 59.4718 13.1425Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask5_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask5_2887_5290)">
                <path
                  d="M72.0488 21.5758V7.30605H74.4997L74.7621 9.17371C75.4913 7.83153 77.0092 6.89771 79.0228 6.89771C81.2403 6.89771 82.8167 8.00642 83.546 9.78663C84.2174 8.00642 85.9391 6.89771 88.1565 6.89771C91.4249 6.89771 93.4089 8.94025 93.4089 12.2375V21.5758H90.7246V12.909C90.7246 10.6619 89.4698 9.37828 87.5436 9.37828C85.4714 9.37828 84.1003 10.8376 84.1003 13.1136V21.5758H81.3863V12.8801C81.3863 10.633 80.1604 9.40716 78.235 9.40716C76.1628 9.40716 74.7917 10.8368 74.7917 13.1128V21.575H72.0488V21.5758Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask6_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask6_2887_5290)">
                <path
                  d="M102.687 6.92651C106.948 6.92651 110.099 10.02 110.099 14.426C110.099 18.832 106.948 21.9255 102.687 21.9255C98.4262 21.9255 95.2461 18.832 95.2461 14.426C95.2461 10.02 98.3974 6.92651 102.687 6.92651ZM102.687 19.4746C105.43 19.4746 107.356 17.4024 107.356 14.426C107.356 11.4496 105.43 9.37741 102.687 9.37741C99.9441 9.37741 98.0179 11.4496 98.0179 14.426C98.0179 17.4024 99.9144 19.4746 102.687 19.4746Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask7_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask7_2887_5290)">
                <path
                  d="M111.615 14.4846C111.615 10.1075 114.154 6.89763 118.385 6.89763C120.574 6.89763 122.413 7.86034 123.376 9.61167V0.0985107H126.09V21.5757H123.639L123.405 18.9788C122.471 20.9339 120.545 21.9263 118.269 21.9263C114.125 21.9263 111.616 18.8328 111.616 14.4854L111.615 14.4846ZM123.346 14.3971C123.346 11.4793 121.624 9.37821 118.823 9.37821C116.021 9.37821 114.387 11.4793 114.387 14.3971C114.387 17.3149 116.021 19.4457 118.823 19.4457C121.624 19.4457 123.346 17.3735 123.346 14.3971Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
              <mask
                id="mask8_2887_5290"
                style={{
                  maskType: "alpha",
                }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="133"
                height="22"
              >
                <rect width="132.71" height="21.8986" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask8_2887_5290)">
                <path
                  d="M128.539 19.8837C128.539 18.7453 129.502 17.8115 130.64 17.8115C131.779 17.8115 132.712 18.7453 132.712 19.8837C132.712 21.0221 131.75 21.9262 130.64 21.9262C129.531 21.9262 128.539 20.9924 128.539 19.8837Z"
                  className="fill-primary-light dark:fill-primary-dark"
                />
              </g>
            </g>
            <defs>
              <clipPath id="clip0_2887_5290">
                <rect width="132.713" height="22" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "70px",
            position: "relative",
            fontFamily: "Satoshi-Bold",
            fontSize: "60px",
            fontStyle: "normal",
            color: "black",
            fontWeight: 700,
            lineHeight: "115%" /* 103.5px */,
            letterSpacing: "-2.7px",
            justifyContent: "center",

            textAlign: "center",
          }}
        >
          <span>{props.title}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "48px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "24px",
                height: "84px",
                width: "84px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid rgba(11, 21, 30, 0.10)",
                borderRadius: "8px",
              }}
            >
              {props.automationFrom.image && (
                <img
                  width={36}
                  height={32}
                  src={props.automationFrom.image}
                  alt="automation-from"
                />
              )}
            </div>
            {props.automationTo.image && (
              <div
                style={{
                  margin: "0 48px",
                  background: "rgba(11, 21, 30, 0.05)",
                  padding: "6px",
                  height: "32px",
                  width: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid rgba(11, 21, 30, 0.10)",
                  borderRadius: "50%",
                  color: "#0B151E99",
                }}
              >
                <Icon name="arrow-right" />
              </div>
            )}
            {props.automationTo.image && (
              <div
                style={{
                  background: "white",
                  padding: "24px",
                  height: "84px",
                  width: "84px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid rgba(11, 21, 30, 0.10)",
                  borderRadius: "8px",
                }}
              >
                {props.automationTo.image && (
                  <img
                    width={36}
                    height={32}
                    src={props.automationTo.image}
                    alt=""
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <svg
          style={{
            marginTop: "70px",
          }}
          xmlns="http://www.w3.org/2000/svg"
          width="1062"
          height="2"
          viewBox="0 0 1062 2"
          fill="none"
        >
          <path
            opacity="0.1"
            d="M0 1L1062 1"
            stroke="url(#paint0_linear_5295_12441)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_5295_12441"
              x1="0.683021"
              y1="1.00003"
              x2="1060.33"
              y2="-41.0599"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0B151E" stopOpacity="0" />
              <stop offset="0.165" stopColor="#0B151E" stopOpacity="0.450549" />
              <stop offset="0.495" stopColor="#0B151E" />
              <stop offset="0.775" stopColor="#0B151E" stopOpacity="0.452703" />
              <stop offset="1" stopColor="#0B151E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            display: "flex",
            marginTop: "24px",
            fontFamily: "Satoshi-Medium",
            fontSize: "30px",
            fontStyle: "normal",

            lineHeight: "100%",
            color: "rgba(11, 21, 30, 0.60)",
          }}
        >
          Codemod Registry
        </div>
      </div>
    </div>
  );
};

export default AutomationToFrom;
