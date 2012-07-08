


def save_css_urls_to_s3(css_string)
  beginning_of_url = css_string.index("url(")
  if beginning_of_url
    url_onward = css_string[beginning_of_url+4..-1]
    end_of_url = url_onward.index(")")
    url = url_onward[0..end_of_url-1].gsub(/\s+/, "")
    url = url[1..-2] if ((url[0] == "'") or (url[0] == '"'))

    new_url = "shiny/new/url"
    first_half = css_string[0..beginning_of_url+3]

    second_half = save_css_urls_to_s3(url_onward[end_of_url..-1])


    return (first_half + new_url + second_half)
  else
    return css_string
  end
end