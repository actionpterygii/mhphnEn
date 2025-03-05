import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Link, Navigate } from "react-router-dom";
import "./main.css";
import wilds_en from "./data/wilds.json";

// Title
function Title() {
  return (
    <h1 id="title">MH:WILDS Weakness List</h1>
  );
}

// Display
function Display({refine, data}) {

  // 全部の値が'null'の場合true
  const isDefault = (function(arr) {
    return arr.every(e => e === 'null');
  })(refine);

  let refinedMonsters = [];
  if (!isDefault) {
    for (const monster of data.monsters) {

      // このモンスターが必要か
      let isRequired = true;

      // 種族
      const category = refine[0];
      if (category !== "null") {
        if (category === monster["category"]) {
          isRequired = true;
        } else {
          isRequired = false;
        }
      }

      // 生息地
      const habitat = refine[1];
      if (habitat !== "null" && isRequired) {
        if (monster["habitat"].includes(habitat)) {
          isRequired = true;
        } else {
          isRequired = false;
        }
      }

      // 攻撃属性
      const enemy_element = refine[2];
      if (enemy_element !== "null" && isRequired) {
        if (monster["enemy_element"].includes(enemy_element)) {
          isRequired = true;
        } else {
          isRequired = false;
        }
      }

      // 弱点属性
      const valid_element = refine[3];
      if (valid_element !== "null" && isRequired) {
        if (monster["valid_element"][valid_element.slice(0,2)] === "◎") {
          isRequired = true;
        } else {
          isRequired = false;
        }
      }

      if (isRequired) {
        refinedMonsters.push(monster);
      }

    }
  }

  return (
    <div id="display">
      {isDefault ?
        data.categories.map((category) => (
          <div key={category} className="category">
            <h2 className="category_name">{category}</h2>
            <CategoryMonsterList key={category} category={category} monsters={data.monsters} />
          </div>
        ))
        :
        refinedMonsters == [] ?
          "nothing"
        :
          refinedMonsters.map((monster) => (
            <Monster key={monster.name} monster={monster} />
          ))
      }
      <div id="notes">
        ※The following table is based on the hunter's notes in the main game.<br></br>
        ※As for the attributes, each part of the body works differently, so we have divided them into ◎, ○, △, and ✕, starting with the attributes that work best on the most common parts of the body.<br></br>
        Also, since each monster is evaluated on a monster-by-monster basis, even at ◎, there are monsters for which the attribute works well and others for which it does not work so well.<br></br>
        We try to fill in from basic ◎, and unless there are too many O's, we use positive values.<br></br>
        ※The state of the art is converted from *3,2,1,O to ◎,○,△,✕.
      </div>
    </div>
  );
}

function CategoryMonsterList({category, monsters}) {
  return (
    <div className="monsters">
      {monsters.filter(monster => monster.category === category).map((monster) => 
        <Monster key={monster.name} monster={monster} />
      )}
    </div>
  );
}

function Monster({monster}) {
  return (
    <div key={monster.name} className="monster">
      <div className="monster_head">
        {monster.alias != "" ?
          <div className="monster_alias">{monster.alias}</div>
        :
          ""
        }
        <h3 className="monster_name">{monster.name}</h3>
      </div>
      <div className="monster_body">
        {Object.keys(monster.valid_element).map((head) => (
          <div key={head} className="valid">
            <div className="valid_head">{head}</div>
            <div className="valid_body">{monster.valid_element[head]}</div>
          </div>
        ))}
      </div>
      <div>{monster.enemy_element.join(', ')}</div>
      <div className="monster_remark">{monster.remark}</div>
    </div>
  );
}

// Control
function Control({onSelectChange, refine, setRefine, data, select}) {
  // 右下メニューの開閉
  const [isMenuHidden, setIsMenuHidden] = useState(true);

  // セレクトを初期値に
  function clearAllSelect() {
    setRefine(Array(4).fill('null'));
  }

  return (
    <div id="control">
      <div id="control_panel">
        <div className="control_select_wrap control_category">
          <select name="category" value={refine[0]} onChange={e => onSelectChange(0, e.target.value)}>
            <option value="null">{select[0]}</option>
            {data.categories.map((category, index) => <option key={index} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="control_select_wrap control_habitat">
          <select name="habitat" value={refine[1]} onChange={e => onSelectChange(1, e.target.value)}>
            <option value="null">{select[1]}</option>
            {data.habitats.map((habitat, index) => <option key={index} value={habitat}>{habitat}</option>)}
          </select>
        </div>
        <div className="control_select_wrap control_enemy_element">
          <select name="enemy_element" value={refine[2]} onChange={e => onSelectChange(2, e.target.value)}>
            <option value="null">{select[2]}</option>
            {data.enemy_elements.map((enemy_element, index) => <option key={index} value={enemy_element}>{enemy_element}</option>)}
          </select>
        </div>
        <div className="control_select_wrap control_valid_element">
          <select name="valid_element" value={refine[3]} onChange={e => onSelectChange(3, e.target.value)}>
            <option value="null">{select[3]}</option>
            {data.valid_elements.map((valid_element, index) => <option key={index} value={valid_element}>{valid_element}</option>)}
          </select>
        </div>
        <div className="control_select_wrap control_valid_element">
          <button type="button" onClick={clearAllSelect}>{select[4]}</button>
        </div>
      </div>
      <div id="menu_button" onClick={() => setIsMenuHidden(false)}>
        <div id="menu_icon">
          <div className="menu_icon_bar"></div>
          <div className="menu_icon_bar"></div>
          <div className="menu_icon_bar"></div>
        </div>
        <div id="menu_text">MENU</div>
      </div>
      <div className={`spotlight_fill${isMenuHidden ? ' spotlight_fill__off' : ''}`} onClick={() => setIsMenuHidden(true)}>
        <div id="menu" onClick={(e) => e.stopPropagation()}>
          <div id="menu_links">
            {data.links.map((link, index) => (
              <Link key={index} to={link.url} className="menu_link" onClick={() => {setIsMenuHidden(true); clearAllSelect();}}>
                {link.name}
              </Link>
            ))}
            <a href="https://www.actionpterygii.com/" className="menu_link actionpterygii">actionpterygii</a>
          </div>
          <div id="menu_close" onClick={() => setIsMenuHidden(true)}></div>
        </div>
      </div>
    </div>
  );
}

// Main
function Main({data}) {

  const location = useLocation();

  const select = [
    'Sel Class',
    'Sel Habitat',
    'Sel Attack Element',
    'Sel Weak Element',
    'Clear'
  ];

  // 読み込み時に実行
  useEffect(() => {
    // バーの有無で変わったりするスマホでも対応できるような縦いっぱい
    const setVh = () => document.documentElement.style.setProperty('--vh', window.innerHeight + 'px');
    window.addEventListener('load', setVh);
    window.addEventListener('resize', setVh);
  }, []);

  // 絞り込み状況
  // 各セレクトボックス
  // 種族、出現フィールド、攻撃属性、最弱点
  const [refine, setRefine] = useState(Array(4).fill('null'));

  // セレクトボックスの値が変化したとき
  function handleSelectChange(type, value) {
    // refineの値を変更
    const newRefine = [...refine];
    newRefine[type] = value;
    setRefine(newRefine);
  }

  return (
    <main id="main">
      <Title />
      <Display refine={refine} data={data} />
      <Control onSelectChange={handleSelectChange} refine={refine} setRefine={setRefine} data={data} select={select} />
    </main>
  );
}

export function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main data={wilds_en} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
