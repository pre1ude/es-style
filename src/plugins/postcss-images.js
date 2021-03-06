import postcss from 'postcss';
import parseImage from '../utils/parse-image';

export default postcss.plugin(
  'postcss-images',
  ({ publicEntry, imageOptions, write, publicPath } = {}) => {
    return (root) => {
      root.walkRules((rule) => {
        // 记录class选择器，主要用来生成随机的class时防止冲突
        //忽略keyframs内的过渡选择器
        if (rule.parent.type !== 'atrule' && rule.parent.name !== 'keyframes') {
          rule.selector.split(',').map((item) => {
            item.split(' ').map((item) => {
              item.split('.').map((item) => {
                if (item !== '' && !/[:|#]/.test(item)) {
                  item = item.replace(/[>|+]/, '');
                  if (global['es-style-class'].indexOf(item) === -1) {
                    global['es-style-class'].push(item);
                  }
                }
              });
            });
          });
        }

        rule.walkDecls((decl) => {
          // 引用多url列出来
          const urls = decl.value.match(/url\([^\)]+\)/g);

          if (urls) {
            //查询css的value是否存在url(<地址>)
            urls.map((url) => {
              const _match = url.match(
                /url\(['|"]?(.*\.(jpg|png|gif|jpeg|svg)(\?.*)?)['|"]?\)/g,
              );
              if (_match) {
                //匹配到数组形式
                _match.map((item) => {
                  /**
                   * 有下面几种形式
                   * url(a.jpg)
                   * url("a.jpg")
                   * url('a.jpg')
                   * url(./a.jpg)
                   */
                  // 匹配出内容区域
                  let content = item.replace(
                    /^url\(["|']?(.*)(jpg|png|gif|jpeg|svg)(\?.*[^"|'])?["|']?\)/,
                    '$1$2\\$3',
                  );
                  content = content.split('\\');
                  let url = content[0];
                  // 判断内容不能已http:、https:、//开头
                  if (!/^http(s)?:|^\/\//.test(url)) {
                    // 这里匹配到的内容需要解析
                    if (!/^[\.|\/]/.test(url)) {
                      // 不以点开头，相对路径
                      // 不以斜杠开头，绝对路径
                      // 那么就是这种写法 url(a.jpg) 默认相对路径，需加上
                      url = './' + url;
                    }
                    try {
                      const itemValue = item.replace(
                        content.join(''),
                        parseImage({
                          url,
                          reference: root.source.input.file,
                          write,
                          imageOptions,
                          publicEntry,
                          publicPath,
                        }),
                      );
                      decl.value = decl.value.replace(item, itemValue);
                    } catch (err) {
                      throw err;
                    }
                  }
                });
              }
            });
          }
        });
      });
    };
  },
);
