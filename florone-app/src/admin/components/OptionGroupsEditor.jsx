import {
  createEmptyOptionChoice,
  createEmptyOptionGroup,
} from "../../data/menuItemUtils";

export default function OptionGroupsEditor({ groups, onChange }) {
  const updateGroup = (groupId, patch) => {
    onChange(
      groups.map((group) =>
        group.id === groupId ? { ...group, ...patch } : group
      )
    );
  };

  const removeGroup = (groupId) => {
    onChange(groups.filter((group) => group.id !== groupId));
  };

  const addGroup = () => {
    onChange([...groups, createEmptyOptionGroup()]);
  };

  const updateChoice = (groupId, choiceId, patch) => {
    onChange(
      groups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          choices: group.choices.map((choice) =>
            choice.id === choiceId ? { ...choice, ...patch } : choice
          ),
        };
      })
    );
  };

  const addChoice = (groupId) => {
    onChange(
      groups.map((group) =>
        group.id === groupId
          ? { ...group, choices: [...group.choices, createEmptyOptionChoice()] }
          : group
      )
    );
  };

  const removeChoice = (groupId, choiceId) => {
    onChange(
      groups.map((group) => {
        if (group.id !== groupId) return group;
        const nextChoices = group.choices.filter((choice) => choice.id !== choiceId);
        return {
          ...group,
          choices: nextChoices.length > 0 ? nextChoices : [createEmptyOptionChoice()],
        };
      })
    );
  };

  return (
    <div className="menu-opt">
      <div className="menu-opt-head">
        <h4 className="menu-opt-title">گزینه‌های سفارشی‌سازی</h4>
        <button type="button" className="menu-opt-add-group" onClick={addGroup}>
          + افزودن گروه
        </button>
      </div>

      {groups.length === 0 && (
        <p className="menu-opt-empty">
          مثلاً نوع قهوه، سس، سیروپ یا اندازه — هر گروه چند گزینه دارد.
        </p>
      )}

      {groups.map((group, groupIndex) => (
        <div key={group.id} className="menu-opt-group">
          <div className="menu-opt-group-head">
            <span className="menu-opt-group-num">گروه {groupIndex + 1}</span>
            <button
              type="button"
              className="menu-opt-remove"
              onClick={() => removeGroup(group.id)}
            >
              حذف گروه
            </button>
          </div>

          <div className="menu-form-row">
            <label className="menu-form-field">
              <span>عنوان گروه</span>
              <input
                type="text"
                value={group.name}
                onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                placeholder="مثلاً نوع قهوه"
              />
            </label>
            <label className="menu-form-field">
              <span>نوع انتخاب</span>
              <select
                value={group.type}
                onChange={(e) => updateGroup(group.id, { type: e.target.value })}
              >
                <option value="single">تک‌انتخابی</option>
                <option value="multiple">چندانتخابی</option>
              </select>
            </label>
          </div>

          <label className="menu-form-check menu-form-check--inline">
            <input
              type="checkbox"
              checked={group.required}
              onChange={(e) => updateGroup(group.id, { required: e.target.checked })}
            />
            <span>انتخاب اجباری برای مشتری</span>
          </label>

          <div className="menu-opt-choices">
            {group.choices.map((choice, choiceIndex) => (
              <div key={choice.id} className="menu-opt-choice">
                <span className="menu-opt-choice-num">{choiceIndex + 1}</span>
                <input
                  type="text"
                  value={choice.label}
                  onChange={(e) =>
                    updateChoice(group.id, choice.id, { label: e.target.value })
                  }
                  placeholder="نام گزینه"
                />
                <input
                  type="text"
                  value={choice.priceDelta}
                  onChange={(e) =>
                    updateChoice(group.id, choice.id, { priceDelta: e.target.value })
                  }
                  placeholder="افزایش قیمت (اختیاری)"
                  className="menu-opt-price"
                />
                <button
                  type="button"
                  className="menu-opt-remove-choice"
                  onClick={() => removeChoice(group.id, choice.id)}
                  aria-label="حذف گزینه"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="menu-opt-add-choice"
            onClick={() => addChoice(group.id)}
          >
            + گزینه جدید
          </button>
        </div>
      ))}
    </div>
  );
}
