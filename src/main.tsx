import "./main.css";

/**
 * 页面初始数据生成
 */
const ITEM_HEIGHT = 32;
const COUNT = 100000;
const MAX_COUNT = Math.ceil(
  document.querySelector(".screen")!.clientHeight / ITEM_HEIGHT
);
const container = document.querySelector(".list");
// const container2 = document.querySelector('.list2')

const listData: Array<{ text: string; top: number }> = [];
for (let i = 0; i < COUNT; i++) {
  listData.push({
    text: i + 1 + "",
    top: 0,
  });
}

listData.forEach((item, index) => {
  item.top = index * ITEM_HEIGHT;
});

const line = createElement("div", {
  className: "line",
});

let runData = listData.slice(0, MAX_COUNT * 2);
if (container) {
  appendElement(runData, container, line);
} else {
  // appendElement(listData, container2, line)
}

interface Options {
  style?: Record<string, string>;
  className?: string;
}

function createElement(tag: string, options: Options = { style: {} }) {
  const dom = document.createElement("div");
  changeDomStyle(dom, options);
  return dom;
}

// 生成假数据
function initInnerHTMLData(dom: any, text: string) {
  dom.innerHTML = text;
  return dom;
}

function changeDomStyle(dom: any, options: Options) {
  const { className, style } = options;
  dom.className = className || "";
  for (const key in style) {
    dom.style[key] = style[key];
  }
}

function appendElement(
  dataList: Array<Record<string, unknown>>,
  container: any,
  child: any
) {
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();
  dataList.forEach((item) => {
    child = initInnerHTMLData(child.cloneNode(true), item.text as string);
    fragment.appendChild(child);
  });
  container.append(fragment);
}

/**
 * 虚拟滚动条
 */
let switchScrollScale = [0, MAX_COUNT * ITEM_HEIGHT];
setBackgroundHeight();

let tick = false;
document.querySelector("#scroll")!.addEventListener("scroll", (e) => {
  if (!tick) {
    tick = true;
    window.requestAnimationFrame(() => {
      tick = false;
    });
    getRunDataList(getScrollDistance(e));
  }
});

function setBackgroundHeight() {
  (document.querySelector(".background") as HTMLElement).style.height =
    getListHeight(ITEM_HEIGHT, COUNT) + "px";
}

function getListHeight(height: number, num: number) {
  return height * num;
}

function getScrollDistance(event: any) {
  return event.target.scrollTop;
}

function getRunDataList(distance: any) {
  // console.log(distance, switchScrollScale)
  if (!switchScroll(distance)) {
    const startIndex = getStartIndex(distance);
    const beforeList = listData.slice(getBeforeIndex(startIndex), startIndex);
    const nowList = listData.slice(startIndex, startIndex + MAX_COUNT);
    const afterList = listData.slice(
      getAfterIndex(startIndex),
      getAfterIndex(startIndex) + MAX_COUNT
    );
    changeListTop(startIndex, (beforeList[0] || listData[startIndex]) as any);
    // console.log(beforeList, nowList, afterList)
    changeSwitchScale(
      startIndex,
      getBeforeIndex(startIndex),
      getAfterIndex(startIndex)
    );
    runData = [...beforeList, ...nowList, ...afterList];
    appendElement(runData, container, line);
  }
}

function changeListTop(
  startIndex: number,
  { top }: { top: number; text?: string }
) {
  // console.log(document.querySelector('.list').style, top)
  (
    document.querySelector(".list") as HTMLElement
  ).style.transform = `translate3d(0, ${top}px, 0)`;
}

function switchScroll(scrollTop: number) {
  return scrollTop > switchScrollScale[0] && scrollTop < switchScrollScale[1];
  // return scrollTop > (COUNT - MAX_COUNT + 1) * ITEM_HEIGHT || scrollTop < (MAX_COUNT - 1) * ITEM_HEIGHT
}

function changeSwitchScale(
  startIndex: number,
  beforeIndex: number,
  afterIndex: number
) {
  const beforeScale = Math.ceil(startIndex) * ITEM_HEIGHT;
  const afterScale = Math.floor(afterIndex) * ITEM_HEIGHT;
  switchScrollScale = [beforeScale, afterScale];
}

// 二分法查找
function getStartIndex(scrollTop: number) {
  let start = 0;
  let end = listData.length - 1;
  while (start < end) {
    const mid = Math.floor((end + start) / 2);
    const { top } = listData[mid];
    if (scrollTop >= top && scrollTop < top + ITEM_HEIGHT) {
      start = mid;
      break;
    } else if (scrollTop >= top + ITEM_HEIGHT) {
      start = mid + 1;
    } else if (scrollTop < top) {
      end = mid - 1;
    }
  }
  return start < 0 ? 0 : start;
}

function getBeforeIndex(startIndex: number) {
  return startIndex - MAX_COUNT < 0 ? 0 : startIndex - MAX_COUNT;
}

function getAfterIndex(startIndex: number) {
  return startIndex + MAX_COUNT > COUNT ? COUNT : startIndex + MAX_COUNT;
}
