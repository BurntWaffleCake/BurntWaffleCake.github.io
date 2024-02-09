let sliders = document.getElementsByClassName("slider");
for (const slider of sliders) {
  const label = slider.querySelector(".slider-label");
  const range = slider.querySelector(".slider-range");
  const number = slider.querySelector(".slider-number");

  if (!label) {
    console.error("slider is missing label");
  }
  if (!range) {
    console.error("slider is missing number range");
  }
  if (!number) {
    console.error("slider is missing number input");
  }

  console.log(slider.getAttribute("value"));

  range.value = slider.getAttribute("value");
  number.value = slider.getAttribute("value");

  range.min = slider.getAttribute("min");
  number.min = slider.getAttribute("min");

  range.max = slider.getAttribute("max");
  number.max = slider.getAttribute("max");

  range.step = slider.getAttribute("step");
  number.step = slider.getAttribute("step");

  const valueChangeEvent = new CustomEvent("onvaluechange", {
    detail: {
      value: slider.getAttribute("value"),
    },
  });

  range.oninput = function (event) {
    number.value = range.value;
    slider.value = range.value;
    valueChangeEvent.detail.value = range.value;
    slider.dispatchEvent(valueChangeEvent);
  };

  number.oninput = function (event) {
    range.value = number.value;
    slider.value = number.value;
    valueChangeEvent.detail.value = number.value;
    slider.dispatchEvent(valueChangeEvent);
  };
}
