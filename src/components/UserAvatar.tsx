import React, { useState, useRef, useEffect } from "react";
import { ImageProps, Image } from "semantic-ui-react";
import lodashIsEqual from "lodash.isequal";

import DefaultAvatar from "@/assets/default-avatar.svg";
import svgToDataUrl from "@/utils/svgToUrl";

interface UserAvatarProps extends ImageProps {
  userAvatar: ApiTypes.UserAvatarDto;
  placeholder?: boolean;
  imageSize?: number;
  onError?: () => void;
}

const defaultAvatarDataUrl = svgToDataUrl(DefaultAvatar);

function getAvatarUrl(avatar: ApiTypes.UserAvatarDto, size: number) {
  switch (avatar.type) {
    case "gravatar":
      return `https://www.gravatar.com/avatar/${avatar.key}?size=${size}&default=404`;
    case "qq":
      let sizeParam: number;
      if (size <= 40) sizeParam = 1;
      else if (size <= 100) sizeParam = 3;
      else if (size <= 140) sizeParam = 4;
      else sizeParam = 5;
      return `https://q1.qlogo.cn/g?b=qq&nk=${avatar.key}&s=${sizeParam}`;
    case "github":
      return `https://github.com/${avatar.key}.png?size=${size}`;
  }
}

const UserAvatar: React.FC<UserAvatarProps> = props => {
  const [error, setError] = useState(false);

  const imageSize =
    props.imageSize ||
    {
      mini: 35,
      tiny: 80,
      small: 150,
      medium: 300,
      large: 450,
      big: 600,
      huge: 800,
      massive: 960
    }[props.size] ||
    80;

  const url = getAvatarUrl(props.userAvatar, Math.ceil(window.devicePixelRatio * imageSize));

  const previousUrl = useRef<string>();
  useEffect(() => {
    previousUrl.current = url;
  });
  if (previousUrl.current !== url && error) setError(false);

  const imageProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !["userAvatar", "placeholder", "imageSize", "errorRef"].includes(key))
  );

  function onImageError() {
    setError(true);
    if (props.onError) props.onError();
  }

  return error || props.placeholder ? (
    <Image src={defaultAvatarDataUrl} {...imageProps} />
  ) : (
    <Image src={url} {...imageProps} onError={onImageError} />
  );
};

export default React.memo(UserAvatar, lodashIsEqual);
